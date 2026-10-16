const jwt = require('jsonwebtoken');
const { TeacherRepository } = require('../models/Teacher');

// Ensure environment variables are loaded if available
if (!process.env.JWT_SECRET) {
  try {
    require('dotenv').config();
  } catch (e) {
    // Ignore if dotenv is unavailable
  }
}

// Retrieve and validate the JWT secret from environment configuration
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    throw new Error('JWT_SECRET environment variable is missing or empty. Please configure JWT_SECRET in your environment.');
  }
  return secret.trim();
};

// Middleware for API endpoints (returns JSON 401 on failure, or 500 on configuration error)
const authenticateApi = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.'
      });
    }

    // Verify token with environment secret
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const teacher = await TeacherRepository.findById(decoded.id);

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Teacher account not found or session expired.'
      });
    }

    req.teacher = teacher;
    req.teacherId = teacher._id ? teacher._id.toString() : teacher.id;
    next();
  } catch (err) {
    if (err.message && err.message.includes('JWT_SECRET environment variable is missing or empty')) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

// Middleware for frontend UI views (redirects to /login if unauthenticated)
const authenticateView = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const teacher = await TeacherRepository.findById(decoded.id);

    if (!teacher) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    req.teacher = teacher;
    req.teacherId = teacher._id ? teacher._id.toString() : teacher.id;
    res.locals.currentTeacher = {
      id: req.teacherId,
      name: teacher.name,
      email: teacher.email,
      daysRemaining: typeof teacher.getDaysRemaining === 'function' ? teacher.getDaysRemaining() : 60,
      isTrialValid: typeof teacher.isTrialValid === 'function' ? teacher.isTrialValid() : true
    };
    next();
  } catch (err) {
    if (err.message && err.message.includes('JWT_SECRET environment variable is missing or empty')) {
      return next(err);
    }
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Optional user attachment for public pages
const attachTeacherIfPresent = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.locals.currentTeacher = null;
    return next();
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const teacher = await TeacherRepository.findById(decoded.id);
    if (teacher) {
      req.teacher = teacher;
      req.teacherId = teacher._id ? teacher._id.toString() : teacher.id;
      res.locals.currentTeacher = {
        id: req.teacherId,
        name: teacher.name,
        email: teacher.email,
        daysRemaining: typeof teacher.getDaysRemaining === 'function' ? teacher.getDaysRemaining() : 60,
        isTrialValid: typeof teacher.isTrialValid === 'function' ? teacher.isTrialValid() : true
      };
    } else {
      res.locals.currentTeacher = null;
    }
  } catch (err) {
    res.locals.currentTeacher = null;
  }
  next();
};

const generateToken = (teacher) => {
  const secret = getJwtSecret();
  const id = teacher._id ? teacher._id.toString() : teacher.id;
  return jwt.sign(
    { id, email: teacher.email, name: teacher.name },
    secret,
    { expiresIn: '30d' }
  );
};

module.exports = {
  authenticateApi,
  authenticateView,
  attachTeacherIfPresent,
  generateToken,
  getJwtSecret,
  get JWT_SECRET() {
    return getJwtSecret();
  }
};
