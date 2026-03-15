import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { email, messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the last message content
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.content || lastMessage.role !== 'user') {
      return NextResponse.json({ error: "Invalid last message" }, { status: 400 });
    }

    await dbConnect();

    // Find or create chat document
    let chat = await Chat.findOne({ email });
    if (!chat) {
      chat = new Chat({ email, messages: [] });
    }

    // Add user message to DB
    chat.messages.push({ role: 'user', content: lastMessage.content });
    
    // Convert to Gemini format
    const history = chat.messages.map((msg: any) => ({
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

    return NextResponse.json(assistantMessage);

  } catch (error: any) {
    console.error("Gemini/DB API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
