const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

    // Build Gemini history from this session's messages (all but the latest we just pushed)
    const history = session.messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await genAI.models.generateContent({
      // model: 'gemini-1.5-flash-latest',
      model: 'gemini-flash-latest',
      contents: history,
    });

    const assistantMessage = {
      role: 'assistant',
      content: response.text,
    };

    // Add assistant reply to session
    session.messages.push(assistantMessage);
    await user.save();

    return res.json({ ...assistantMessage, sessionId: session._id });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.get('/models', async (req, res) => {
  const models = await genAI.models.list();
  res.json(models);
});


module.exports = router;