import { MongoClient } from 'mongodb';
import { PRIVATE_URI } from '$env/static/private';

const client = new MongoClient(PRIVATE_URI);

export async function connectToDatabase() {
    await client.connect();
    return client.db("rosey");
}

export type ChatMessage = {
    user: string;
    text: string;
    timestamp: string;
};