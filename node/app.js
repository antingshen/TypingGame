var UUID = require('node-uuid');
var app = require('express')();
// socket.io needs to use http server for Express 3
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

server.listen(3000);

io.configure(function () {
    io.set('log level', 0);
});

// called when client first connects
// (at least if i'm reading docs/tutorial right)
io.sockets.on('connection', function (client) {
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
	response.sendfile(__dirname + '/index.html');
});