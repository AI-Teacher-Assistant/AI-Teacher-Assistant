require('dotenv').config();
const app = require('./app');
const { connectDB, getDbStatus } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  console.log('--------------------------------------------------');
  console.log('   AI Teacher Assistant - Starting Server');
  console.log('--------------------------------------------------');

  // Attempt database connection
  await connectDB();
  const dbStatus = getDbStatus();
  console.log(`[Storage] Running in [${dbStatus.mode.toUpperCase()}] mode.`);

  const server = app.listen(PORT, () => {
    console.log(`[Server] Application listening on port ${PORT}`);
    console.log(`[Server] Teacher Assistant Dashboard: http://localhost:${PORT}`);
    console.log(`[Server] API Base: http://localhost:${PORT}/api`);
    console.log('--------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
