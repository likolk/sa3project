const mongodb = require('mongodb');

// const mongodb_uri = 'mongodb://127.0.0.1:27017';

const mongodb_uri = 'mongodb+srv://dbUser:eixl5MGj45wf4sOr@sunderflow.2gw57tz.mongodb.net/?retryWrites=true&w=majority'

const client = new mongodb.MongoClient(mongodb_uri);

/* Quiz 3 */
const db_name = 'sunderflow';

/* Quiz 4 */
const collection_names = ['posts', 'users', 'tags', 'accounts', 'badges'];

/* Quiz 5 */
const model = {};

console.log("Connecting to mongodb server");

/* Quiz 6 */
client.connect() /* Quiz 7 */
    .then((client) => {
        console.log("Connected to mongodb server");

        /* Quiz 8 */
        model.db = client.db(db_name);
        collection_names.forEach(c=>{
            /* Quiz 9 */
            model[c] = model.db.collection(c);
        })


    }) /* Quiz 10 */
    .catch(err => console.error(err));

exports.model = model;