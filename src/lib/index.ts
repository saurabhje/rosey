import { MongoClient } from 'mongodb';

const uri = process.env.URI || "";
const client = new MongoClient(uri);

let isConnected = false;

export async function connectToDatabase() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
    }
    return client.db('rosey');
}


