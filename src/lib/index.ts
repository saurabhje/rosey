import { MongoClient } from 'mongodb';
import { PRIVATE_URI } from '$env/static/private';

const client = new MongoClient(PRIVATE_URI);

export async function connectToDatabase() {
    await client.connect();
    return client.db("rosey-chat");
}

export type ChatMessage = {
    user: string;
    text: string;
    timestamp: string;
};

export type groupeDmessage = {
    date: string
    messages: ChatMessage[];
}