var mongodb = require('mongodb');
var credentials = require('./../private/config').mongodb;

var MongoClient = mongodb.MongoClient;
var url = "mongodb://"+credentials.user+":"+credentials.password+"@ds153715.mlab.com:53715/webrtc-test";

var mydb = {};

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
        mydb.db = db;
    }
});

mydb.createUser = function(socketId, uuid, name) {
    mydb.db.collection('users').insertOne({
        "socketId" : socketId,
        "uuid" : uuid,
        "name" : name,
        "connections" : []
    });
};

mydb.findUser = function(uuid) {
    return mydb.db.collection('users').find({
        "uuid" : uuid
    }).limit(1);
};

mydb.getAllUsers = function() {
    return mydb.db.collection('users').find({});
};

mydb.deleteAllUsers = function() {
    mydb.db.collection('users').deleteMany({});
};

module.exports = mydb;