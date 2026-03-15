import mongoose from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IChat extends mongoose.Document {
  email: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

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

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
