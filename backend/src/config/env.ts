import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { AppEnv } from '../types/env.js';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);
const envFilePath = resolve(currentDirectory, '../../.env');

dotenv.config({ path: envFilePath });

function parseBooleanEnv(value: string | undefined, fallback = false): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true' || value === '1';
}

function getRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env: AppEnv = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: getRequiredEnv('MONGO_URI', 'mongodb://127.0.0.1:27017/ivyts-1997'),
  useInMemoryDb: parseBooleanEnv(process.env.USE_IN_MEMORY_DB, false),
  clientUrl: getRequiredEnv('CLIENT_URL', 'http://localhost:5173'),
  jwtAccessSecret: getRequiredEnv('JWT_ACCESS_SECRET', 'replace-me'),
  jwtRefreshSecret: getRequiredEnv('JWT_REFRESH_SECRET', 'replace-me'),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
};
