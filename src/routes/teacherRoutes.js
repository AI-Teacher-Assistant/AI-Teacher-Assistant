const express = require('express');
const router = express.Router();
const { authenticateApi } = require('../middleware/auth');

const formatUsage = (teacher) => ({
  notesGenerated: (teacher.usage && teacher.usage.notesGenerated) || 0,
  assignmentsGenerated: (teacher.usage && teacher.usage.assignmentsGenerated) || 0,
  questionsGenerated: (teacher.usage && teacher.usage.questionsGenerated) || 0,
  totalAIGenerations: (teacher.usage && teacher.usage.totalAIGenerations) || 0,
  pdfExports: (teacher.usage && teacher.usage.pdfExports) || 0
});

/**
 * @route   GET /api/health
 * @desc    System health check for cloud deployment monitoring
 */
router.get('/health', (req, res) => {
  const { getDbStatus } = require('../config/db');
  const dbStatus = getDbStatus();
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus.mode
  });
});

/**
 * @route   GET /api/teachers/me
 * @desc    Get currently logged in teacher profile with usage metrics
 */
router.get('/teachers/me', authenticateApi, (req, res) => {
  const teacher = req.teacher;
  const teacherId = teacher._id ? teacher._id.toString() : teacher.id;
  const daysRemaining = typeof teacher.getDaysRemaining === 'function'
    ? teacher.getDaysRemaining()
    : Math.max(0, Math.ceil((new Date(teacher.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const isTrialValid = typeof teacher.isTrialValid === 'function'
    ? teacher.isTrialValid()
    : Boolean(teacher.isTrialActive && new Date() <= new Date(teacher.trialEndDate));

  return res.status(200).json({
    success: true,
    teacher: {
      id: teacherId,
      name: teacher.name,
      email: teacher.email,
      trialStartDate: teacher.trialStartDate,
      trialEndDate: teacher.trialEndDate,
      isTrialActive: teacher.isTrialActive,
      isTrialValid,
      daysRemaining,
      usage: formatUsage(teacher)
    }
  });
});

/**
 * @route   GET /api/subscription/status
 * @desc    Get trial, subscription, and usage status
 */
router.get('/subscription/status', authenticateApi, (req, res) => {
  const teacher = req.teacher;
  const daysRemaining = typeof teacher.getDaysRemaining === 'function'
    ? teacher.getDaysRemaining()
    : Math.max(0, Math.ceil((new Date(teacher.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const isTrialValid = typeof teacher.isTrialValid === 'function'
    ? teacher.isTrialValid()
    : Boolean(teacher.isTrialActive && new Date() <= new Date(teacher.trialEndDate));

  return res.status(200).json({
    success: true,
    trial: {
      isActive: teacher.isTrialActive,
      isValid: isTrialValid,
      startDate: teacher.trialStartDate,
      endDate: teacher.trialEndDate,
      daysRemaining,
      isExpired: !isTrialValid || daysRemaining <= 0,
      planName: '2-Month Free Educator Trial'
    },
    usage: formatUsage(teacher)
  });
});

module.exports = router;
