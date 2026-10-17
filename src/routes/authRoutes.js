const express = require('express');
const router = express.Router();
const { TeacherRepository } = require('../models/Teacher');
const { generateToken, authenticateApi } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new teacher and initiate 2-month trial
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already exists
    const existing = await TeacherRepository.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A teacher account with this email already exists.'
      });
    }

    // Create teacher
    const teacher = await TeacherRepository.create({ name, email, password });
    const token = generateToken(teacher);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    const teacherId = teacher._id ? teacher._id.toString() : teacher.id;
    const userPayload = {
      id: teacherId,
      name: teacher.name,
      email: teacher.email,
      trialsUsed: (teacher.usage && teacher.usage.totalAIGenerations) || 0,
      trialLimit: 5,
      quizCount: (teacher.usage && teacher.usage.questionsGenerated) || 0,
      lessonCount: (teacher.usage && teacher.usage.notesGenerated) || 0,
      assignCount: (teacher.usage && teacher.usage.assignmentsGenerated) || 0
    };
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your 2-month free trial has started.',
      token,
      user: userPayload,
      teacher: {
        id: teacherId,
        name: teacher.name,
        email: teacher.email,
        trialStartDate: teacher.trialStartDate,
        trialEndDate: teacher.trialEndDate,
        isTrialActive: teacher.isTrialActive,
        daysRemaining: typeof teacher.getDaysRemaining === 'function' ? teacher.getDaysRemaining() : 60
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate teacher & return token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required.'
      });
    }

    const teacher = await TeacherRepository.findByEmail(email);
    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found with that email.'
      });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    const token = generateToken(teacher);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    const teacherId = teacher._id ? teacher._id.toString() : teacher.id;
    const userPayload = {
      id: teacherId,
      name: teacher.name,
      email: teacher.email,
      trialsUsed: (teacher.usage && teacher.usage.totalAIGenerations) || 0,
      trialLimit: 5,
      quizCount: (teacher.usage && teacher.usage.questionsGenerated) || 0,
      lessonCount: (teacher.usage && teacher.usage.notesGenerated) || 0,
      assignCount: (teacher.usage && teacher.usage.assignmentsGenerated) || 0
    };
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userPayload,
      teacher: {
        id: teacherId,
        name: teacher.name,
        email: teacher.email,
        trialStartDate: teacher.trialStartDate,
        trialEndDate: teacher.trialEndDate,
        isTrialActive: teacher.isTrialActive,
        daysRemaining: typeof teacher.getDaysRemaining === 'function' ? teacher.getDaysRemaining() : 60
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in teacher for frontend dashboard
 */
router.get('/me', authenticateApi, (req, res) => {
  const teacher = req.teacher;
  const teacherId = teacher._id ? teacher._id.toString() : teacher.id;
  const trialsUsed = (teacher.usage && teacher.usage.totalAIGenerations) || 0;
  return res.status(200).json({
    success: true,
    user: {
      id: teacherId,
      name: teacher.name,
      email: teacher.email,
      trialsUsed,
      trialLimit: 5,
      quizCount: (teacher.usage && teacher.usage.questionsGenerated) || 0,
      lessonCount: (teacher.usage && teacher.usage.notesGenerated) || 0,
      assignCount: (teacher.usage && teacher.usage.assignmentsGenerated) || 0
    }
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clear auth cookie & terminate session
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = router;
