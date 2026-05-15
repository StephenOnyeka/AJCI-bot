const express = require('express');
const router = express.Router();
const User = require('../models/User');
const chatQueue = require('../queue/chatQueue');
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

router.post('/', async (req, res) => {
  try {
    const { email, messages, sessionId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content || lastMessage.role !== 'user') {
      return res.status(400).json({ error: 'Invalid last message' });
    }

    // Find or create user document
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({ email: email.toLowerCase(), sessions: [] });
    }

    let session;

    if (sessionId) {
      // Find the existing session by id
      session = user.sessions.id(sessionId);
    }

    if (!session) {
      // Create a brand-new session; title will be set from first message
      const title = lastMessage.content.trim().substring(0, 50) || 'New Chat';
      user.sessions.push({ title, messages: [] });
      session = user.sessions[user.sessions.length - 1];
    }

    // Add the user message to the session
    session.messages.push({ role: 'user', content: lastMessage.content });

    // Save the user's message immediately so it's in the DB
    await user.save();

    // Build Gemini history from this session's messages
    const history = session.messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Enqueue job for worker to process asynchronously
    const job = await chatQueue.add('generate-chat-response', {
      email,
      sessionId: session._id,
      history,
    });

    // Immediately return 202 Accepted with the Job ID and Session ID
    return res.status(202).json({ 
      message: 'Chat request accepted',
      jobId: job.id,
      sessionId: session._id 
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/chat/status/:jobId
// Endpoint for frontend Next.js to poll job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const job = await chatQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const reason = job.failedReason;
    const result = job.returnvalue;

    res.json({
      id: job.id,
      state, // 'waiting', 'active', 'completed', 'failed', etc.
      reason,
      result // Populated with assistantMessage if completed
    });
  } catch (error) {
    console.error('Job Status Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// hit /api/chat/models and you'll see exactly which model strings are valid for your key and SDK version.
router.get('/models', async (req, res) => {
  const models = await genAI.models.list();
  res.json(models);
});


module.exports = router;