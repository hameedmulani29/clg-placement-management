const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance (Atlas Cloud or Local development)
 * Configured with automatic reconnection and unified topology.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true, // Build indexes automatically in development
    });

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection lost. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`[Database Critical] Failed to connect to MongoDB: ${error.message}`);
    // In production, exit on initial failure so container/orchestrator can restart
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Gracefully close the MongoDB connection (used during server shutdown or test teardown)
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed gracefully.');
  } catch (err) {
    console.error(`[Database Error] Error during disconnection: ${err.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
