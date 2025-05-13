import { MongoClient } from 'mongodb';

const uri =process.env.URI || ""
const client = new MongoClient(uri);

export async function connectToDatabase() {
    await client.connect();
    return client.db("rosey");
}

export type ChatMessage = {
    user: string;
    text: string;
    timestamp: string;
};