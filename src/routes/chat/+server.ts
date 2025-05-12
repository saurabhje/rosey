import { connectToDatabase, run } from '$lib';
import { json } from '@sveltejs/kit';
import type { ChatMessage } from '$lib'

export async function GET() {
    const db = await connectToDatabase();
    const messages = await db.collection('messages').find().sort({ _id: 1 }).toArray();
    return json(messages);
}

export async function POST({ request }) {
    const message: ChatMessage = await request.json();
    console.log(run())
    const db = await connectToDatabase();
    await db.collection('messages').insertOne(message);
    return new Response('Message stored', { status: 201 });
}