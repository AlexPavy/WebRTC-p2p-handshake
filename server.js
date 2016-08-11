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

var messaging = require("./service/messaging");
messaging.start(httpServer);

console.log('Server running. Visit http://localhost:' + port);