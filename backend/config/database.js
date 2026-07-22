import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Load environment variables (useful in case this file is imported outside main server.js)
dotenv.config();

/**
 * Connects to MongoDB Atlas using mongoose.
 * Configures connection options and handles success/error cases.
 */
const connectDB = async () => {
  try {
    // Set Google and Cloudflare DNS servers to bypass Node.js c-ares DNS resolution issues on local routers/hotspots
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    
    // Note: Mongoose v9+ automatically handles useNewUrlParser and useUnifiedTopology.
    // Specifying them explicitly throws a hard error in recent Mongoose releases.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
