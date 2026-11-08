import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Load environment variables
dotenv.config();

let mongoServer = null;

/**
 * Connects to MongoDB Atlas using the provided MONGODB_URI.
 * In production, connection to MongoDB Atlas is strictly mandatory.
 * If the connection fails, it logs a descriptive error and terminates startup.
 * In development, if Atlas is unreachable or USE_IN_MEMORY_DB is set, it falls back
 * to MongoMemoryServer with clear explicit logging for local testing.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';
  const forceInMemory = !isProduction && process.env.USE_IN_MEMORY_DB === 'true';

  // If in non-production and forceInMemory is requested:
  if (forceInMemory) {
    try {
      console.log('[DEV NOTICE] Initializing in-memory MongoDB server for local development/testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[DEV SUCCESS] MongoDB Connected (In-Memory Local Server): ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (memError) {
      console.error(`[DEV ERROR] Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }

  // In production, MONGODB_URI is strictly required
  if (isProduction && (!uri || uri.includes('your_mongodb_connection_string'))) {
    console.error('\n=============================================================');
    console.error('[CRITICAL DATABASE CONFIGURATION ERROR]');
    console.error('MONGODB_URI is missing or not configured for production.');
    console.error('Please configure your MongoDB Atlas connection string in your Render environment variables.');
    console.error('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    console.error('=============================================================\n');
    process.exit(1);
  }

  // Configure public DNS resolvers to handle SRV lookups on network routers that block SRV
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {}

  // Attempt connection to MongoDB Atlas if URI is provided
  if (uri && !uri.includes('your_mongodb_connection_string')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[SUCCESS] MongoDB Connected (Atlas): ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (error) {
      console.error('\n=============================================================');
      console.error(`[CRITICAL ERROR] MongoDB Atlas Connection Failed: ${error.message}`);
      if (isProduction) {
        console.error('Production server cannot start without an active MongoDB Atlas database.');
        console.error('Please verify your MONGODB_URI, Atlas IP whitelist (allow 0.0.0.0/0 for Render), and credentials.');
        console.error('=============================================================\n');
        process.exit(1);
      }
      console.warn('[DEV NOTICE] Atlas connection could not be established in non-production mode.');
      console.warn('Reason:', error.message);
      console.error('=============================================================\n');
    }
  }

  // Non-production fallback if Atlas failed: allow MongoMemoryServer
  if (!isProduction) {
    try {
      console.log('[DEV NOTICE] Falling back to in-memory MongoDB server for local development/testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[DEV SUCCESS] MongoDB Connected (In-Memory Local Server): ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (memError) {
      console.error(`[DEV ERROR] Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

/**
 * Disconnects from MongoDB and cleanly stops any active in-memory server.
 */
export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed cleanly.');
    }
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
      console.log('In-memory MongoDB server stopped.');
    }
  } catch (error) {
    console.error(`Error during database disconnection: ${error.message}`);
  }
};

export default connectDB;
