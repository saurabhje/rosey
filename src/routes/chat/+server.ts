import { connectToDatabase } from '$lib';
import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { ChatMessage } from '$lib'

export async function GET({url}) {
    const db = await connectToDatabase();
    const lastid = url.searchParams.get('lastid');
    const query = lastid ? { _id: { $lt: new ObjectId(lastid) } } : {};
    const messages = await db.collection('messages')
        .find(query)
        .limit(5)
        .sort({ _id: -1 })
        .toArray();
    return json(messages.reverse());
}

export async function POST({ request }) {
    const message: ChatMessage = await request.json();
    const db = await connectToDatabase();
    await db.collection('messages').insertOne(message);
    return new Response('Message stored', { status: 201 });
}