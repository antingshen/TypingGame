var UUID = require('node-uuid');
var express = require('express');
var app = express();
app.use('/game', express.static(__dirname + '/static'));
// socket.io needs to use http server for Express 3
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var running_games = {};
var player_list = {};

server.listen(3000);

app.get('/', function(request, response){
	response.sendfile(__dirname + '/index.html');
});

app.get('/game/', function(request, response){
    response.sendfile(__dirname + '/frontend/index.html');
});

io.configure(function () {
    io.set('log level', 0);
});

lobby = require('./lobby.js')
engine_maker = require('./gamecore.js')
// called when client connects
// (at least if i'm reading docs/tutorial right)
io.sockets.on('connection', function (client) {
    // use UUID as client id
    client.userid = UUID();
    client.game = null;
    player_list[client.userid] = client;
    // inform of connection
    client.emit('onconnected', { id: client.userid });
    console.log('socket.io:: client ' + client.userid + ' connected');
    // try to find game
    lobby.findGame(client);
    if (client.game.player_count == 2) {
        // start the game
        var game = client.game;
        var engine = engine_maker();
        engine.setupGame(game.player_host, game.player_client,
                         getClient(game.player_host.userid), getClient(game.player_client.userid));
        running_games[game.player_host.userid] = engine;
        running_games[game.player_client.userid] = engine;
        // attach a callback on game end
        engine.endGame = function () {
            // TODO is there other stuff to do here?
            delete running_games[game.player_host.userid];
            delete running_games[game.player_client.userid];
        };
        console.log('Started game');
    }
    // called when client disconnects
    client.on('disconnect', function () {
        console.log('socket.io:: client disconnected ' + client.userid);
        // if player was in game, end that game
        // TODO remove client from player list
        if (client.game) {
            lobby.endGame(client.game);
        }
    });
});

function getGame(id) {
    return running_games[id];
}

function getClient(id) {
    return player_list[id];
}

io.sockets.on('key', function (data) {
    console.log('Key: ' + data.letter);
    console.log('ID: ' + data.id);
    var game = getGame(data.id);
    if (game) {
        game.keyPressed(data.id, data.letter);
    }
});