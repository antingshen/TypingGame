var UUID = require('node-uuid');
var app = require('express')();
// socket.io needs to use http server for Express 3
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function(request, response){
	response.sendfile(__dirname + '/index.html');
});

app.get('/game/', function(request, response){
    response.sendfile(__dirname + '/frontend/index.html');
});
app.get('/game/angular.min.js', function(request, response){
    response.sendfile(__dirname + '/frontend/angular.min.js');
});
app.get('/game/app.js', function(request, response){
    response.sendfile(__dirname + '/frontend/app.js');
});
app.get('/game/style.css', function(request, response){
    response.sendfile(__dirname + '/frontend/style.css');
});

io.configure(function () {
    io.set('log level', 0);
});

lobby = require('./lobby.js')

// called when client connects
// (at least if i'm reading docs/tutorial right)
io.sockets.on('connection', function (client) {
    // use UUID as client id
    client.userid = UUID();
    client.game = null;
    // inform of connection
    client.emit('onconnected', { id: client.userid });
    console.log('socket.io:: client ' + client.userid + ' connected');
    // try to find game
    lobby.findGame(client);
    // called when client disconnects
    client.on('disconnect', function () {
        console.log('socket.io:: client disconnected ' + client.userid);
        // if player was in game, end that game
        if (client.game) {
            lobby.endGame(client.game);
        }
    });
});