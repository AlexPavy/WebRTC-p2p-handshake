var db, io;

function start(httpServer) {
    io = require('socket.io').listen(httpServer);
    db = require("./users");

    io.sockets.on('connection', function (socket) {
        console.log('A client is connected : ' + socket.id);
        socket.on('message', function (message) {
            receive(socket, message)
        });
        socket.on('dbmessage', function (dbmessage) {
            receiveDbMessage(socket, dbmessage)
        });

    });
}

function receiveDbMessage(socket, dbmessageJson) {
    console.log('received db message: %s', dbmessageJson);
    var dbmessage = JSON.parse(dbmessageJson);

    switch (dbmessage.goal) {
        case "register":
            db.createUser(socket.id, dbmessage.uuid, dbmessage.userName);
            socket.emit("dbmessage", "Created user : " + dbmessageJson);
            break;

        case "contactUser":
            if (!dbmessage.remoteUserId || dbmessage.remoteUserId == dbmessage.uuid) {
                socket.emit("dbmessage", "Cannot contact user ");
                return;
            }
            db.findUser(dbmessage.remoteUserId).next(function(_, remoteUser) {
                if (!remoteUser || !remoteUser.socketId || !io.sockets.sockets[remoteUser.socketId]) {
                    socket.emit("dbmessage", "Cannot find user " + dbmessage.remoteUserId);
                    return;
                }
                io.sockets.sockets[remoteUser.socketId].emit("user_message", dbmessageJson);
                socket.emit("dbmessage", "Contacted user " + dbmessage.remoteUserId);
            });
            break;

        case "getUsers":
            db.getAllUsers().toArray(function (_, res) {
                socket.emit("dbmessage", JSON.stringify(res));
            });
            break;

        case "deleteUsers":
            db.deleteAllUsers();
            socket.emit("dbmessage", "Deleted all users");
            break;

        default:
            socket.emit("dbmessage", "Unknow dbmessage.goal value");
    }

}

function receive(socket, message) {
    console.log('received: %s', message);
    socket.broadcast.emit('message', message);
}

module.exports = {
    "start" : start
};