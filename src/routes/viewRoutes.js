const express = require('express');
const router = express.Router();
const { authenticateView, attachTeacherIfPresent } = require('../middleware/auth');
const { DocumentRepository } = require('../models/Document');

/**
 * Landing Page
 */
router.get('/', attachTeacherIfPresent, (req, res) => {
  if (res.locals.currentTeacher) {
    return res.redirect('/dashboard');
  }
  res.render('index', { title: 'AI Teacher Assistant - Empowering Educators' });
});

/**
 * Login Page
 */
router.get('/login', attachTeacherIfPresent, (req, res) => {
  if (res.locals.currentTeacher) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Teacher Login - AI Teacher Assistant' });
});

/**
 * Register Page
 */
router.get('/register', attachTeacherIfPresent, (req, res) => {
  if (res.locals.currentTeacher) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { title: 'Register - 2 Month Free Trial' });
});

/**
 * Protected Dashboard
 */
router.get('/dashboard', authenticateView, async (req, res) => {
  try {
    const documents = await DocumentRepository.findByTeacher(req.teacherId);
    res.render('dashboard', {
      title: 'Teacher Dashboard - AI Teacher Assistant',
      teacher: res.locals.currentTeacher,
      documents
    });
  } catch (err) {
    console.error('Dashboard render error:', err);
    res.render('dashboard', {
      title: 'Teacher Dashboard - AI Teacher Assistant',
      teacher: res.locals.currentTeacher,
      documents: []
    });
  }
});

module.exports = router;
