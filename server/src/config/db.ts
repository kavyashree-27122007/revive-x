// ============================================================
// REVIVE X — MongoDB Connection
// Falls back to in-memory store if MongoDB is unavailable
// ============================================================
import mongoose from 'mongoose';

export type DbStatus = 'connected' | 'disconnected' | 'in_memory';

let dbStatus: DbStatus = 'disconnected';

export function getDbStatus(): DbStatus {
  return dbStatus;
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[DB] MONGODB_URI not set — running with in-memory store');
    dbStatus = 'in_memory';
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    dbStatus = 'connected';
    console.info('[DB] Connected to MongoDB');

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected');
      dbStatus = 'disconnected';
    });

    mongoose.connection.on('reconnected', () => {
      console.info('[DB] MongoDB reconnected');
      dbStatus = 'connected';
    });
  } catch (err) {
    console.error('[DB] MongoDB connection failed — falling back to in-memory store', err);
    dbStatus = 'in_memory';
  }
}

export function isMongoConnected(): boolean {
  return dbStatus === 'connected';
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  dbStatus = 'disconnected';
}
