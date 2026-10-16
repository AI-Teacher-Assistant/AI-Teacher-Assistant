const mongoose = require('mongoose');
const { getDbStatus } = require('../config/db');

// In-memory fallback collection for offline environments
const memoryDocuments = new Map();

const documentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.Mixed, // allows ObjectId or String
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['notes', 'assignment', 'questions'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'all'],
    default: 'medium'
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseDocument = mongoose.models.Document || mongoose.model('Document', documentSchema);

// Unified Repository Layer supporting MongoDB with resilient in-memory fallback
class DocumentRepository {
  static async create({ teacherId, title, subject, topic, type, difficulty = 'medium', content, metadata = {} }) {
    const { isConnected } = getDbStatus();

    if (isConnected) {
      const doc = new MongooseDocument({
        teacherId,
        title,
        subject,
        topic,
        type,
        difficulty,
        content,
        metadata
      });
      await doc.save();
      return doc;
    }

    // In-memory fallback
    const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date();
    const doc = {
      _id: id,
      id,
      teacherId: teacherId.toString(),
      title,
      subject,
      topic,
      type,
      difficulty,
      content,
      metadata,
      createdAt: now,
      updatedAt: now
    };
    memoryDocuments.set(id, doc);
    return doc;
  }

  static async findByTeacher(teacherId) {
    const tId = teacherId.toString();
    const { isConnected } = getDbStatus();

    if (isConnected) {
      return MongooseDocument.find({ teacherId: tId }).sort({ updatedAt: -1 });
    }

    const docs = [...memoryDocuments.values()]
      .filter(d => d.teacherId === tId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return docs;
  }

  static async findByIdAndTeacher(id, teacherId) {
    const tId = teacherId.toString();
    const { isConnected } = getDbStatus();

    if (isConnected) {
      // Find document and ensure teacher ownership
      return MongooseDocument.findOne({ _id: id, teacherId: tId });
    }

    const doc = memoryDocuments.get(id);
    if (!doc || doc.teacherId !== tId) {
      return null;
    }
    return doc;
  }

  static async findById(id) {
    const { isConnected } = getDbStatus();
    if (isConnected) {
      return MongooseDocument.findById(id);
    }
    return memoryDocuments.get(id) || null;
  }

  static async update(id, teacherId, { title, content, difficulty }) {
    const tId = teacherId.toString();
    const { isConnected } = getDbStatus();

    if (isConnected) {
      const updateData = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (difficulty !== undefined) updateData.difficulty = difficulty;

      return MongooseDocument.findOneAndUpdate(
        { _id: id, teacherId: tId },
        updateData,
        { new: true }
      );
    }

    const doc = memoryDocuments.get(id);
    if (!doc || doc.teacherId !== tId) return null;

    if (title !== undefined) doc.title = title;
    if (content !== undefined) doc.content = content;
    if (difficulty !== undefined) doc.difficulty = difficulty;
    doc.updatedAt = new Date();
    return doc;
  }

  static async delete(id, teacherId) {
    const tId = teacherId.toString();
    const { isConnected } = getDbStatus();

    if (isConnected) {
      const result = await MongooseDocument.findOneAndDelete({ _id: id, teacherId: tId });
      return Boolean(result);
    }

    const doc = memoryDocuments.get(id);
    if (!doc || doc.teacherId !== tId) return false;
    memoryDocuments.delete(id);
    return true;
  }
}

module.exports = { Document: MongooseDocument, DocumentRepository };
