
angular.module('game', [])
.controller('gameController',
function($scope,$timeout){
	s = $scope;

	wordNum = -1;
	alphabet = "abcdefghijklmnopqrstuvwxyz";
	getTestWord = function(){
		wordNum += 1;
		var index = wordNum % 26;
		return {
			'word':alphabet.charAt(index)+'TestWord',
			'score':1,
		}
	}

	GAME_HEIGHT = 600;
	GAME_WIDTH = 680;
	WORD_HEIGHT = 50;
	WORD_WIDTH = 100;

	$scope.words = [];
	$scope.wordMap = {};
	$scope.initials = {};


	function awardWord(word){
		this.score += word.score;
	}
	$scope.players = [];
	var initPlayer = function(pid){
		var player = {};
		player.pid = pid;
		player.score = 0;
		$scope.players[pid] = player;
		player.awardWord = awardWord.bind(player);
	}
	initPlayer(0); initPlayer(1);
	$scope.player = $scope.players[0];
	$scope.opponent = $scope.players[1];

	inputBox = document.getElementById('inputBox');
	$scope.bodyClick = function(){
		inputBox.focus();
	}

	function typeLetter(letter, player){
		var correct = this.remaining.charAt(0);
		if (correct.toLowerCase()==letter){
			this.typed += correct;
			this.remaining = this.remaining.slice(1,this.remaining.length);
			$scope.socket.emit('key', 
				{'word':this.word, 'letter':letter}
			)
		} else {
			return;
		}
		if (this.remaining.length == 0){
			player.awardWord(this);
			this.destroy(this);
		}
	}

	function destroy(){
		$timeout.cancel(this.tick);
		var index = this.container.indexOf(this);
		$scope.initials[this.word.charAt(0).toLowerCase()] = undefined;
		if ($scope.currentWord == this){
			$scope.currentWord = undefined;
		}
		this.opacity = 0;
		$timeout(function(){
			this.container.splice(index, 1);
		}.bind(this), 500);
	}

	function wordTick(){
		this.tick = $timeout(function(){
			if (this.life <= 0){
				this.destroy();
				return;
			}
			this.life -= 50;
			this.Yoffset = (1-this.life/this.maxLife)*(GAME_HEIGHT+WORD_HEIGHT)-WORD_HEIGHT;
			this.wordTick();
		}.bind(this), 500);
	}

	$scope.createWord = function(word){
		word.maxLife = word.maxLife || 1000;
		word.life = word.maxLife;
		word.Yoffset = -WORD_HEIGHT;
		word.container = $scope.words;
		word.typeLetter = typeLetter.bind(word);
		word.destroy = destroy.bind(word);
		word.wordTick = wordTick.bind(word);
		word.Xoffset = getXoffset(WORD_WIDTH);
		word.typed = "";
		word.remaining = word.word;
		word.owner = -1;
		word.opacity = 1;

		$scope.words.push(word);
		$scope.initials[word.word.charAt(0).toLowerCase()] = word;
		$scope.wordMap[word.word] = word;
		$timeout(word.wordTick);
	}

	var getXoffset = function(word_width){
		return Math.random()*(GAME_WIDTH-word_width);
	}

	$scope.wordStyle = function(word){
		style = {}
		style.top = String(word.Yoffset)+"px";
		style.left = String(word.Xoffset)+"px";
		if (word.opacity == 0){
			style.opacity = "0";
			style.transform = "rotateY(90deg)";
			style['-webkit-transform'] = style.transform;
		}
		return style;
	}

	$scope.keyPressed = function(event){
		letter = String.fromCharCode(event.charCode).toLowerCase();
		if (!$scope.currentWord){
			var word = $scope.initials[letter]
			if (word.owner != -1){
				return;
			}
			$scope.currentWord = word;
			$scope.currentWord.owner = 0;
		}
		if ($scope.currentWord){
			$scope.currentWord.typeLetter(letter, $scope.player);
		}
	}

	$scope.opponentKey = function(obj){
		var word = $scope.wordMap[obj.word];
		if (word.owner != 1){
			word.owner = 1;
			word.remaining = word.word;
			word.typed = "";
		}
		typeLetter.bind(word)(obj.letter, 1);
	}

	$scope.socket = io.connect('/');

	$scope.socket.on('newWord', $scope.createWord);
	// param: {word: String}

	$scope.socket.on('opponentKey', $scope.opponentKey);
	// param: {word: String, letter: String}
})








