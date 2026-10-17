const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const documentRoutes = require('./routes/documentRoutes');
const generateRoutes = require('./routes/generateRoutes');
const viewRoutes = require('./routes/viewRoutes');

const app = express();

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Core Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', teacherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', generateRoutes);

// Direct navigation routes for Frontend generators
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, '../frontend/quiz.html')));
app.get('/lesson', (req, res) => res.sendFile(path.join(__dirname, '../frontend/lesson.html')));
app.get('/assignment', (req, res) => res.sendFile(path.join(__dirname, '../frontend/assignment.html')));
app.get('/spa-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dashboard.html')));

// View / UI Routes
app.use('/', viewRoutes);

// 404 Handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found.`
    });
  }
  res.status(404).render('partials/404', {
    title: 'Page Not Found - AI Teacher Assistant',
    path: req.path
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);

  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }

  res.status(err.status || 500).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h2>Something went wrong</h2>
      <p>${err.message || 'An unexpected error occurred.'}</p>
      <a href="/" style="color: #2563eb; text-decoration: underline;">Return to Home</a>
    </div>
  `);
});

module.exports = app;
