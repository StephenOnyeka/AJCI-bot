const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
});

const ChatSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
