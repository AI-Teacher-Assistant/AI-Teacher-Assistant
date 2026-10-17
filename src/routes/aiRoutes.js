const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const { TeacherRepository } = require('../models/Teacher');
const { authenticateApi } = require('../middleware/auth');
const { requireActiveTrial } = require('../middleware/trial');

/**
 * @route   POST /api/ai/notes
 * @desc    Generate lecture notes using AI
 */
router.post('/notes', authenticateApi, requireActiveTrial, async (req, res) => {
  try {
    const { subject, topic, gradeLevel, additionalInstructions } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required to generate notes.'
      });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to generate notes.'
      });
    }

    const result = await AIService.generateNotes({
      subject: subject.trim(),
      topic: topic.trim(),
      gradeLevel: gradeLevel ? gradeLevel.trim() : 'Secondary / High School',
      additionalInstructions: additionalInstructions ? additionalInstructions.trim() : ''
    });

    await TeacherRepository.recordUsage(req.teacherId, 'notes');

    return res.status(200).json(result);
  } catch (err) {
    console.error('AI Notes generation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate notes: ' + err.message
    });
  }
});

/**
 * @route   POST /api/ai/assignments
 * @desc    Generate academic assignment using AI
 */
router.post('/assignments', authenticateApi, requireActiveTrial, async (req, res) => {
  try {
    const { subject, topic, difficulty = 'medium', instructions } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required to generate an assignment.'
      });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to generate an assignment.'
      });
    }

    const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    const result = await AIService.generateAssignment({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty: validDifficulty,
      instructions: instructions ? instructions.trim() : ''
    });

    await TeacherRepository.recordUsage(req.teacherId, 'assignment');

    return res.status(200).json(result);
  } catch (err) {
    console.error('AI Assignment generation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate assignment: ' + err.message
    });
  }
});

/**
 * @route   POST /api/ai/questions
 * @desc    Generate Easy, Medium, or Hard questions using AI
 */
router.post('/questions', authenticateApi, requireActiveTrial, async (req, res) => {
  try {
    const { subject, topic, difficulty = 'medium', questionCount = 5, questionType = 'mixed' } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required to generate questions.'
      });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to generate questions.'
      });
    }

    const count = parseInt(questionCount, 10);
    if (isNaN(count) || count < 1 || count > 30) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be a number between 1 and 30.'
      });
    }

    const validDifficulty = ['easy', 'medium', 'hard'].includes((difficulty || '').toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    const result = await AIService.generateQuestions({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty: validDifficulty,
      questionCount: count,
      questionType: questionType || 'mixed'
    });

    await TeacherRepository.recordUsage(req.teacherId, 'questions');

    return res.status(200).json(result);
  } catch (err) {
    console.error('AI Question generation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate questions: ' + err.message
    });
  }
});

module.exports = router;
