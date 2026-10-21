const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

// Start database and server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`Fatal: Failed to connect to database in production: ${error.message}`);
      process.exit(1);
    }
    console.warn(`\n⚠️  [Database Warning] Could not connect to SQLite: ${error.message}`);
    console.warn(`👉 [Database Tip] PlaceCloud will continue running. SQLite database is at backend/data/placement.db.\n`);
  }

  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 PlaceCloud REST API Server Running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`====================================================`);
  });
};

// Graceful process termination
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Process] Received ${signal}. Commencing graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server stopped accepting new requests.');
      await disconnectDB();
      console.log('[Process] Cleanup complete. Exiting.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

startServer();
