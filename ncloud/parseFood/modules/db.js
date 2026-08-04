const MongoClient = require('mongodb').MongoClient;

async function connectDB(url) {
  if (!url) {
    throw new Error('DB_URL is required');
  }

  const client = new MongoClient(url, {
    appName: 'letmeknow-parse-food',
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  });

  await client.connect();
  return client;
}

async function insertDocument(db, { collectionName, data }) {
  const collection = db.collection(collectionName);
  await collection.insertOne(data);
}

module.exports = {
  connectDB,
  insertDocument
}
