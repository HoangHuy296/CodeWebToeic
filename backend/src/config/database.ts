import mongoose from 'mongoose';
import { env } from './env.js';

let inMemoryServerStop: null | (() => Promise<void>) = null;

function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/(\/\/)([^@]+@)/, '$1***@');
  } catch {
    return 'mongodb://***';
  }
}

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (env.useInMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();

    await mongoose.connect(memoryUri);

    inMemoryServerStop = async () => {
      await memoryServer.stop();
    };

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB in-memory connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB in-memory disconnected');
    });

    console.log('MongoDB in-memory connected');
    return;
  }

  const maxRetries = 3;
  let attempt = 0;

  async function tryConnect(): Promise<void> {
    attempt += 1;
    console.log(`MongoDB: attempting connection (${attempt}/${maxRetries}) to ${maskMongoUri(env.mongoUri)}`);

    try {
      await mongoose.connect(env.mongoUri);

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });

      console.log('MongoDB connected');
    } catch (error) {
      console.error(`MongoDB connect failed on attempt ${attempt}:`, error);

      if (attempt >= maxRetries) {
        console.error('MongoDB: exceeded max connection attempts');
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`MongoDB: retrying in ${delay}ms`);
      await new Promise((res) => setTimeout(res, delay));
      return tryConnect();
    }
  }

  await tryConnect();
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (inMemoryServerStop) {
    await inMemoryServerStop();
    inMemoryServerStop = null;
  }
}
