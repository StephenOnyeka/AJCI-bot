const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

router.get('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    const chat = await Chat.findOne({ email });

    if (!chat) {
      return res.status(200).json({ messages: [] });
    }

    return res.status(200).json({ messages: chat.messages });
  } catch (error) {
    console.error("History API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
