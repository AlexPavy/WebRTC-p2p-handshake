var fs = require('fs');
var http = require('http');

// ----------------------------------------------------------------------------------------

var port = 8080;

var express = require('express');
var app = express();
var router = express.Router();

router.get('/', function(req, res) {
    res.render('client/index.html', { title: 'Test webRTC' });
});
app.use(express.static(__dirname + '/client'));

var httpServer = http.createServer(app);
httpServer.listen(port);

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
var io = require('socket.io').listen(httpServer);


io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');
    socket.on('message', function(message) {
        console.log('received: %s', message);
        socket.broadcast.emit('message', message);
    });
});

console.log('Server running. Visit https://localhost:' + port);