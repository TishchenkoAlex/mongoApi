import { MongoClient } from 'mongodb';
import { SQLClient } from '../sql/sql-client';
import { DEFAULT_POOL } from '../sql/DEFAULT_POOL';
import { dateReviverUTC } from '../fuctions/dateReviver';

export async function SqlToMongoDocuments() {
  return;
  const uri = process.env.MONGODB!;
  const mongoClient = await new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }).connect();
  const collectionDocuments = mongoClient.db('x100').collection('Documents');
  await collectionDocuments.deleteMany({});

  const SQLSession = new SQLClient(DEFAULT_POOL);
  const SQLRequest = await SQLSession.manyOrNoneStream(`select id as _id, * FROM [Documents]`);

  let batch: any[] = [];

  SQLRequest.on('row', async row => {
    const rawDoc: any = {};
    row.forEach(col => rawDoc[col.metadata.colName] = col.value);
    const doc = JSON.parse(rawDoc.doc, dateReviverUTC);
    delete rawDoc.doc; delete rawDoc.id;
    const flatDoc = { ...rawDoc, ...doc };
    if (batch.length < 10000)
      batch.push(flatDoc);
    else if (batch.length === 10000) {
      const insert = batch;
      batch = [];
      await collectionDocuments.insertMany(insert);
    }
  });

  SQLRequest.on('done', async () => {
    await collectionDocuments.insertMany(batch);
    await mongoClient.close();
  });

  SQLRequest.resume();
}
