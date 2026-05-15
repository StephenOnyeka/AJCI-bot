require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const redisConnection = require('../utils/redis');
const User = require('../models/User'); // Mongoose model depends on connection

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenAI({ apiKey });

// Connect to MongoDB specifically for the worker process
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Worker connected to MongoDB'))
  .catch((err) => console.error('Worker MongoDB connection error:', err));

const chatWorker = new Worker(
  'ChatQueue',
  async (job) => {
    const { email, sessionId, history } = job.data;

    try {
      console.log(`[Job ${job.id}] Prompting Gemini API...`);
      const response = await genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: history,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.text,
      };

      console.log(`[Job ${job.id}] Saving response to database...`);
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error(`User not found for email: ${email}`);

      const session = user.sessions.id(sessionId);
      if (!session) throw new Error(`Session not found for id: ${sessionId}`);

      // Add assistant reply to session
      session.messages.push(assistantMessage);
      await user.save();

      console.log(`[Job ${job.id}] Completed successfully!`);
      // Return value is stored automatically in BullMQ job data and can be retrieved later
      return assistantMessage;
    } catch (error) {
      console.error(`[Job ${job.id}] Error:`, error.message);
      // Throw the error so BullMQ can attempt to retry the job
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Throttle concurrent requests to 5
  }
);

chatWorker.on('completed', (job) => {
  console.log(`[Job ${job.id}] marked as completed`);
});

chatWorker.on('failed', (job, err) => {
  console.log(`[Job ${job.id}] failed with error: ${err.message}`);
});

console.log('Chat Worker is running and waiting for jobs...');
