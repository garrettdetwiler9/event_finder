import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import './config/firebase'; // Initialize Firebase Admin SDK on startup
import userRouter from './routes/users';
import eventRouter from './routes/events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON request bodies
app.use(express.json());

// Health check route — useful for Railway to confirm the server is alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/users', userRouter);
app.use('/events', eventRouter);

// Connect to MongoDB Atlas then start the server
// If the DB connection fails, connectDB() calls process.exit(1) — server won't start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;
