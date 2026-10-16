const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getDbStatus } = require('../config/db');

// In-memory fallback collection for offline/no-mongo environments
const memoryTeachers = new Map();

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 2 months
  },
  isTrialActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Helper for trial calculation
teacherSchema.methods.getDaysRemaining = function() {
  const now = new Date();
  const diffTime = new Date(this.trialEndDate) - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

teacherSchema.methods.isTrialValid = function() {
  return Boolean(this.isTrialActive && new Date() <= new Date(this.trialEndDate));
};

// Password comparison
teacherSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseTeacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

// Unified Repository Layer supporting MongoDB with resilient in-memory fallback
class TeacherRepository {
  static async create({ name, email, password, trialDays = 60 }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const { isConnected } = getDbStatus();

    if (isConnected) {
      const teacher = new MongooseTeacher({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        trialStartDate: now,
        trialEndDate: trialEnd,
        isTrialActive: true
      });
      await teacher.save();
      return teacher;
    }

    // In-memory fallback
    const existing = [...memoryTeachers.values()].find(t => t.email === email.toLowerCase().trim());
    if (existing) {
      const err = new Error('Email already registered');
      err.code = 11000;
      throw err;
    }

    const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const teacherDoc = {
      _id: id,
      id,
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      trialStartDate: now,
      trialEndDate: trialEnd,
      isTrialActive: true,
      createdAt: now,
      getDaysRemaining: function() {
        const diffTime = new Date(this.trialEndDate) - new Date();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      },
      isTrialValid: function() {
        return Boolean(this.isTrialActive && new Date() <= new Date(this.trialEndDate));
      },
      comparePassword: async function(candidate) {
        return bcrypt.compare(candidate, this.password);
      }
    };
    memoryTeachers.set(id, teacherDoc);
    return teacherDoc;
  }

  static async findByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const { isConnected } = getDbStatus();

    if (isConnected) {
      return MongooseTeacher.findOne({ email: cleanEmail });
    }

    return [...memoryTeachers.values()].find(t => t.email === cleanEmail) || null;
  }

  static async findById(id) {
    const { isConnected } = getDbStatus();

    if (isConnected) {
      return MongooseTeacher.findById(id);
    }

    return memoryTeachers.get(id) || null;
  }

  static async updateTrialStatus(id, { isTrialActive, trialEndDate }) {
    const { isConnected } = getDbStatus();

    if (isConnected) {
      return MongooseTeacher.findByIdAndUpdate(
        id,
        { ...(isTrialActive !== undefined && { isTrialActive }), ...(trialEndDate && { trialEndDate }) },
        { new: true }
      );
    }

    const teacher = memoryTeachers.get(id);
    if (!teacher) return null;
    if (isTrialActive !== undefined) teacher.isTrialActive = isTrialActive;
    if (trialEndDate) teacher.trialEndDate = new Date(trialEndDate);
    return teacher;
  }
}

module.exports = { Teacher: MongooseTeacher, TeacherRepository };
