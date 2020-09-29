require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://'
    + process.env.MONGO_USER + ':'
    + process.env.MONGO_PASS + '@'
    + process.env.MONGO_SRV + '/'
    + process.env.MONGO_DB + '?retryWrites=true&w=majority';
console.log(uri);
const client = new MongoClient(uri, {
    useNewUrlParser: true
});

function iterateFunc(doc) {
    console.log(JSON.stringify(doc, null, 4));
}

function errorFunc(error) {
    console.log(error);
}

function readData() {

    client.connect(err => {
        const db = client.db('posts-store');
        let cursor = db.collection('posts').find({});
        cursor.forEach(iterateFunc, errorFunc);

        client.close();
    });
}

function connectCollection() {

    client.connect(err => {
        const collection = client.db("posts-store").collection("posts");
        // perform actions on the collection object
        if (collection) {
            console.log('Connect DB', collection.collectionName);
        } else {
            console.log('No Connection', collection.collectionName);
        }

        client.close();
    });
}

readData();
