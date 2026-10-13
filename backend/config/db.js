import mongoose from 'mongoose';
import { inMemoryStore } from '../services/dbStore.js';

let isMongoConnected = false;

export const isDbConnected = () => isMongoConnected;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/propertyconnect';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Live Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database Info] Could not connect to MongoDB at ${uri}: ${err.message}`);
    console.log('[Database Info] Switching to Standalone In-Memory Store (Zero-config college demo mode)...');
    isMongoConnected = false;
    await inMemoryStore.init();
    return null;
  }
};

export const closeDB = async () => {
  if (isMongoConnected) {
    await mongoose.disconnect();
    isMongoConnected = false;
  }
};
