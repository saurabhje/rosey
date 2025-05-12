import { MongoClient } from 'mongodb';

const uri = process.env.URI || "mongodb+srv://rosey:rosey@txt.aqvxyhr.mongodb.net/?retryWrites=true&w=majority&appName=txt";
const client = new MongoClient(uri);
let isConnected = false;

export async function connectToDatabase() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
        console.log('connected')
    }
    return client.db('rosey');
}

export type ChatMessage = {
	user: string;
	text: string;
};