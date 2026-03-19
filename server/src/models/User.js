const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const SessionSchema = new mongoose.Schema({
  title: { type: String, default: 'New Chat' },
  messages: [MessageSchema],
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sessions: [SessionSchema],
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
