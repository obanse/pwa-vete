
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://mongodb_amk:UHfoDt0WMxgN@clusteramk.euws8.mongodb.net/posts-store?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

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
