const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-teacher-assistant';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // fast failover to memory store if Mongo daemon not active
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection warning: ${err.message}`);
    console.warn('[Database] Operating with resilient fallback store so MVP works reliably.');
    return false;
  }
};

const getDbStatus = () => ({
  isConnected,
  mode: isConnected ? 'mongodb' : 'in-memory-fallback'
});

module.exports = { connectDB, getDbStatus };
