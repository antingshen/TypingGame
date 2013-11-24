var fs = require('fs');
// DOS file so split on \r\n
var all_words = fs.readFileSync(__dirname + '/word_list.txt', 'utf8').split('\r\n');
var start_letters = {};
// Set ALL the attributes to null!
// Except a couple.
var engine = modules.exports = { curr_words: [],
                                 MAX_WORDS: 25,
                                 player1: {
                                    userid: null,
                                    word: null,
                                    partial: null,
                                    score: 0
                                 },
                                 player2: {
                                    word: null,
                                    partial: null,
                                    score: 0
                                 }
                                 };

// Semi fancy logging!
engine.log = function (msg) {
    console.log("Game engine: " + msg);
}

// TODO consider making these functions not attributes
 
engine.setupGame = function () {
    // Add random words to fill up bank
    var word;
    while (this.curr_words.length < this.MAX_WORDS) {
        word = all_words[Math.floor(Math.random()*allWords.length()];
        if (word && !(word[0] in start_letters)) {
            this.curr_words.push(word);
            start_letters[word[0]] = word;
        }
    }
};

// Only sends the id, so it shouldn't be able to change game state
engine.keyPressed = function (userid, ch) {
    // Check given player is in game
    if (userid != this.player1.userid && userid != this.player2.userid) {
        this.log("player " + userid + " is not a player in this game.");
    }
    // because players are objects, these should be references
    var player, opp;
    if (userid == this.player1.userid) [
        player = this.player1;
        opp = this.player2;
    } else {
        player = this.player2;
        opp = this.player1;
    }
    if (!player.word) {
        // Check if player claims a word
        if (ch in start_letters) {
            var to_claim = start_letters[ch];
            if (opp.word == to_claim) {
                this.log(to_claim " already claimed by " + opp.userid + "!");
                return; // TODO maybe a message about this to client?
            }
            player.word = to_claim;
            player1.partial = ch;
        }
    } else {
        // Check if next letter was typed
        // assumes partial is always a substring of the word
        if (player.word[player.partial.length] == ch) {
            player.partial += ch;
            if (player.partial == player.word) {
                finishedWord(this, player);
            }
        } else {
            return; // TODO maybe a message about this?
        }
    }
};

// this game engine (might) be exposed to client,
// so use a function with engine as argument
function finishedWord(game_engine, player) {
    player.word = null;
    player.score += 1;
}