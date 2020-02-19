import { MongoClient } from 'mongodb';

const agg = [
  {
    '$match': {
      'type': 'Catalog.Bank'
    }
  }, {
    '$lookup': {
      'from': 'Documents',
      'localField': 'company',
      'foreignField': '_id',
      'as': 'company'
    }
  }, {
    '$unwind': {
      'path': '$company'
    }
  }, {
    '$lookup': {
      'from': 'Documents',
      'localField': 'user',
      'foreignField': '_id',
      'as': 'user'
    }
  }, {
    '$unwind': {
      'path': '$user'
    }
  }, {
    '$project': {
      'type': 1,
      'code': 1,
      'description': 1,
      'deleted': 1,
      'parent': 1,
      'posted': 1,
      'isfolder': 1,
      'info': 1,
      'company': '$company.description',
      'user': '$user.description',
      'Code1': 1,
      'Code2': 1,
      'Address': 1,
      'KorrAccount': 1,
      'isActive': 1
    }
  }, {
    '$sort': {
      'isfolder': 1,
      'description': 1
    }
  }
];


export async function CatalogBank() {
  const uri = process.env.MONGODB!;
  const mongoClient = await new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }).connect();
  const Documents = mongoClient.db('x100').collection('Documents');
  const BankAccount = Documents.find({ type: 'Catalog.Bank' }).limit(1).forEach(e => {
    console.log(e);
  });
  const custor = Documents.aggregate(agg).limit(1);
  const result1 = await custor.toArray();
  console.log(result1);
}
