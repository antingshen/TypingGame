var io = require('socket.io');
var UUID = require('node-uuid');
var express = require('express');
var app = express();
var server = require('http').createServer(app)

// socket.io testing
// needs to use http server for Express 3
var sio = io.listen(server);

sio.configure(function () {
    sio.set('log level', 0);
});

// called when client first connects
// (at least if i'm reading docs/tutorial right)
sio.sockets.on('connection', function (client) {
    // use UUID as client id
    client.userid = UUID();
    // inform of connection
    client.emit('onconnected', { id: client.userid });
    console.log('socket.io:: client ' + client.userid + ' connected');
    
    // called when client disconnects
    client.on('disconnect', function () {
        console.log('socket.io:: client disconnected ' + client.userid);
    });
});

app.get('/', function(request, response){
    // TODO This path is hardcoded, change it later
    // Different from tutorial! Seems like it was changed in Express 3
	response.sendfile('../index.html');
});

app.listen(3000);