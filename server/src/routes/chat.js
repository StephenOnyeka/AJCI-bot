const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

router.post('/', async (req, res) => {
  try {
    const { email, messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the last message content
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.content || lastMessage.role !== 'user') {
      return res.status(400).json({ error: "Invalid last message" });
    }

    // Find or create chat document
    let chat = await Chat.findOne({ email });
    if (!chat) {
      chat = new Chat({ email, messages: [] });
    }

    // Add user message to DB
    chat.messages.push({ role: 'user', content: lastMessage.content });
    
    // Convert to Gemini format
    const history = chat.messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history
    });

    const assistantMessage = {
      role: "assistant",
      content: response.text
    };

    // Add assistant message to DB and save
    chat.messages.push(assistantMessage);
    await chat.save();

    return res.json(assistantMessage);

  } catch (error) {
    console.error("Gemini/DB API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = router;
