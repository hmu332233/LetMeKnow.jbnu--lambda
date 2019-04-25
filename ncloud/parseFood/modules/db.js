const MongoClient = require('mongodb').MongoClient;

async function connectDB(url) {
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
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