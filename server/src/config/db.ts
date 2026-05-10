import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // Fail loudly if the env variable is missing — better than a cryptic crash later
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);

    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1); // Stop the server — there's no point running without a DB connection
  }
};

export default connectDB;
