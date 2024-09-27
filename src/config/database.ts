import mongoose from 'mongoose';

import logger from '../utils/logger';

async function dbConnect(): Promise<void> {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    logger.error('MONGODB_URI environment variable is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUri);
    logger.info('DB connected');
  } catch (error) {
    logger.error('Could not connect to db');
    process.exit(1);
  }
}

export default dbConnect;
