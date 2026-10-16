const express = require('express');
const router = express.Router();
const { DocumentRepository } = require('../models/Document');
const { authenticateApi } = require('../middleware/auth');
const { requireActiveTrial } = require('../middleware/trial');
const PDFService = require('../services/pdfService');

/**
 * @route   GET /api/documents
 * @desc    List all documents owned by authenticated teacher
 */
router.get('/', authenticateApi, async (req, res) => {
  try {
    const documents = await DocumentRepository.findByTeacher(req.teacherId);
    return res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (err) {
    console.error('List documents error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents.'
    });
  }
});

/**
 * @route   POST /api/documents
 * @desc    Save a generated/edited document for the current teacher
 */
router.post('/', authenticateApi, async (req, res) => {
  try {
    const { title, subject, topic, type, difficulty = 'medium', content, metadata = {} } = req.body;

    if (!title || !subject || !topic || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, topic, type, and content are required fields.'
      });
    }

    if (!['notes', 'assignment', 'questions'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be notes, assignment, or questions.'
      });
    }

    const doc = await DocumentRepository.create({
      teacherId: req.teacherId,
      title: title.trim(),
      subject: subject.trim(),
      topic: topic.trim(),
      type,
      difficulty,
      content,
      metadata
    });

    return res.status(201).json({
      success: true,
      message: 'Document saved successfully.',
      document: doc
    });
  } catch (err) {
    console.error('Create document error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save document.'
    });
  }
});

/**
 * @route   GET /api/documents/:id
 * @desc    Retrieve one document owned by current teacher
 */
router.get('/:id', authenticateApi, async (req, res) => {
  try {
    const doc = await DocumentRepository.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Strict ownership verification
    const docTeacherId = doc.teacherId ? doc.teacherId.toString() : '';
    if (docTeacherId !== req.teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this document.'
      });
    }

    return res.status(200).json({
      success: true,
      document: doc
    });
  } catch (err) {
    console.error('Get document error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve document.'
    });
  }
});

/**
 * @route   PATCH /api/documents/:id
 * @desc    Update owned document
 */
router.patch('/:id', authenticateApi, async (req, res) => {
  try {
    const { title, content, difficulty } = req.body;

    const existing = await DocumentRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Ownership check
    const docTeacherId = existing.teacherId ? existing.teacherId.toString() : '';
    if (docTeacherId !== req.teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to modify this document.'
      });
    }

    const updated = await DocumentRepository.update(req.params.id, req.teacherId, {
      title,
      content,
      difficulty
    });

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully.',
      document: updated
    });
  } catch (err) {
    console.error('Update document error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update document.'
    });
  }
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete owned document
 */
router.delete('/:id', authenticateApi, async (req, res) => {
  try {
    const existing = await DocumentRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Ownership check
    const docTeacherId = existing.teacherId ? existing.teacherId.toString() : '';
    if (docTeacherId !== req.teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this document.'
      });
    }

    await DocumentRepository.delete(req.params.id, req.teacherId);
    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.'
    });
  } catch (err) {
    console.error('Delete document error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document.'
    });
  }
});

/**
 * @route   GET /api/documents/:id/pdf
 * @desc    Export owned document as PDF (Requires active trial & ownership)
 */
router.get('/:id/pdf', authenticateApi, requireActiveTrial, async (req, res) => {
  try {
    const doc = await DocumentRepository.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Ownership check
    const docTeacherId = doc.teacherId ? doc.teacherId.toString() : '';
    if (docTeacherId !== req.teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to export this document.'
      });
    }

    const sanitizedTitle = (doc.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedTitle}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await PDFService.generateDocumentPDF(doc, req.teacher, res);
  } catch (err) {
    console.error('PDF export error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF.'
      });
    }
  }
});

module.exports = router;
