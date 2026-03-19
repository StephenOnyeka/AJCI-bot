const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/history/register — store user email in MongoDB on sign-in
router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({ email: email.toLowerCase(), sessions: [] });
      await user.save();
    }

    return res.status(200).json({ message: 'User registered', email: user.email });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/history?email=... — returns all sessions (titles only, no messages)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ sessions: [] });

    // Return sessions sorted newest-first, without the messages array for performance
    const sessions = user.sessions
      .map((s) => ({
        _id: s._id,
        title: s.title,
        createdAt: s.createdAt,
        messageCount: s.messages.length,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('History List Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/history/session?email=...&sessionId=... — returns full messages for one session
router.get('/session', async (req, res) => {
  try {
    const { email, sessionId } = req.query;
    if (!email || !sessionId) {
      return res.status(400).json({ error: 'Email and sessionId are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const session = user.sessions.id(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    return res.status(200).json({ messages: session.messages, sessionId: session._id });
  } catch (error) {
    console.error('Session Load Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
