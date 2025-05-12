import { MongoClient } from 'mongodb';

const uri ="mongodb+srv://rosey:rosey@txt.aqvxyhr.mongodb.net/?retryWrites=true&w=majority&appName=txt"
const client = new MongoClient(uri);

export async function connectToDatabase() {
    await client.connect();
    return client.db("txt");
    console.log("Connected to MongoDB");
}

export type ChatMessage = {
    user: string;
    text: string;
};