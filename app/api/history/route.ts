import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const chat = await Chat.findOne({ email });

    if (!chat) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: chat.messages });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
