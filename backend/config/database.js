import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Load environment variables
dotenv.config();

let mongoServer = null;

/**
 * Connects to MongoDB. First attempts MongoDB Atlas (if a valid URI is provided),
 * and falls back to a local in-memory MongoDB server if the connection fails or is missing.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isDefaultOrExpired = !uri || 
                             uri.includes('your_mongodb_connection_string') || 
                             uri.includes('fsbeuhd.mongodb.net');

  if (!isDefaultOrExpired) {
    try {
      console.log('Attempting connection to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB Atlas Connection Error: ${error.message}`);
      console.log('Falling back to local in-memory MongoDB...');
    }
  } else {
    console.log('No valid MongoDB Atlas connection string configured. Starting in-memory MongoDB...');
  }

  try {
    mongoServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(inMemoryUri);
    console.log(`MongoDB Connected (In-Memory Local Server): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Failed to start in-memory MongoDB server: ${error.message}`);
  }
};

/**
 * Disconnects from MongoDB and stops the in-memory server if it was started.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB server stopped.');
    }
  } catch (error) {
    console.error(`Error during database disconnection: ${error.message}`);
  }
};

export default connectDB;

