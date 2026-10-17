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
  usage: {
    notesGenerated: { type: Number, default: 0 },
    assignmentsGenerated: { type: Number, default: 0 },
    questionsGenerated: { type: Number, default: 0 },
    totalAIGenerations: { type: Number, default: 0 },
    pdfExports: { type: Number, default: 0 }
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
        isTrialActive: true,
        usage: {
          notesGenerated: 0,
          assignmentsGenerated: 0,
          questionsGenerated: 0,
          totalAIGenerations: 0,
          pdfExports: 0
        }
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
      usage: {
        notesGenerated: 0,
        assignmentsGenerated: 0,
        questionsGenerated: 0,
        totalAIGenerations: 0,
        pdfExports: 0
      },
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
    if (!id || typeof id !== 'string' || !id.trim()) {
      return null;
    }
    const cleanId = id.trim();
    const { isConnected } = getDbStatus();

    if (isConnected) {
      if (cleanId.startsWith('mem_')) {
        return memoryTeachers.get(cleanId) || null;
      }
      if (!mongoose.Types.ObjectId.isValid(cleanId)) {
        return null;
      }
      try {
        return await MongooseTeacher.findById(cleanId);
      } catch (err) {
        return null;
      }
    }

    return memoryTeachers.get(cleanId) || null;
  }

  static async recordUsage(id, usageType) {
    if (!id || !usageType) return null;
    const cleanId = typeof id === 'string' ? id.trim() : id;
    const { isConnected } = getDbStatus();

    const fieldMap = {
      notes: 'usage.notesGenerated',
      assignment: 'usage.assignmentsGenerated',
      questions: 'usage.questionsGenerated',
      pdf: 'usage.pdfExports'
    };

    const targetField = fieldMap[usageType];
    if (!targetField) return null;

    if (isConnected) {
      if (typeof cleanId === 'string' && mongoose.Types.ObjectId.isValid(cleanId)) {
        const incObject = { [targetField]: 1 };
        if (usageType !== 'pdf') {
          incObject['usage.totalAIGenerations'] = 1;
        }
        return await MongooseTeacher.findByIdAndUpdate(
          cleanId,
          { $inc: incObject },
          { new: true }
        );
      }
    }

    const teacher = memoryTeachers.get(cleanId);
    if (teacher) {
      if (!teacher.usage) {
        teacher.usage = {
          notesGenerated: 0,
          assignmentsGenerated: 0,
          questionsGenerated: 0,
          totalAIGenerations: 0,
          pdfExports: 0
        };
      }
      if (usageType === 'notes') teacher.usage.notesGenerated = (teacher.usage.notesGenerated || 0) + 1;
      if (usageType === 'assignment') teacher.usage.assignmentsGenerated = (teacher.usage.assignmentsGenerated || 0) + 1;
      if (usageType === 'questions') teacher.usage.questionsGenerated = (teacher.usage.questionsGenerated || 0) + 1;
      if (usageType !== 'pdf') teacher.usage.totalAIGenerations = (teacher.usage.totalAIGenerations || 0) + 1;
      if (usageType === 'pdf') teacher.usage.pdfExports = (teacher.usage.pdfExports || 0) + 1;
      return teacher;
    }
    return null;
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
