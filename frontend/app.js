
angular.module('game', [])
.controller('gameController',
function($scope,$timeout){
	s = $scope;

	wordNum = -1;
	alphabet = "abcdefghijklmnopqrstuvwxyz";
	getTestWord = function(){
		wordNum += 1;
		var index = wordNum % 26;
		return {'word':alphabet.charAt(index)+'TestWord'}
	}

	GAME_HEIGHT = 600;
	GAME_WIDTH = 680;
	WORD_HEIGHT = 50;
	WORD_WIDTH = 100;

	//var socket = io.connect('http:??????');
	$scope.words = [];
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

	inputBox = document.getElementById('inputBox');
	$scope.bodyClick = function(){
		inputBox.focus();
	}

	function typeLetter(letter, player){
		var correct = this.remaining.charAt(0);
		if (correct.toLowerCase()==letter){
			this.typed += correct;
			this.remaining = this.remaining.slice(1,this.remaining.length);
		}
		if (this.remaining.length == 0){
			player.awardWord(this);
			this.destroy(this);
		}
	}

	function destroy(){
		$timeout.cancel(this.tick);
		var index = this.container.indexOf(this);
		this.container.splice(index, 1);
		$scope.initials[this.word.charAt(0).toLowerCase()] = undefined;
		if ($scope.currentWord == this){
			$scope.currentWord = undefined;
		}
	}

	function wordTick(){
		this.tick = $timeout(function(){
			if (this.life <= 0){
				this.destroy();
				return;
			}
			this.life -= 100;
			this.Yoffset = (1-this.life/this.maxLife)*(GAME_HEIGHT+WORD_HEIGHT)-WORD_HEIGHT;
			this.wordTick();
		}.bind(this), 1000);
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

		$scope.words.push(word);
		$scope.initials[word.word.charAt(0).toLowerCase()] = word;
		$timeout(word.wordTick);
	}

	var getXoffset = function(word_width){
		return Math.random()*(GAME_WIDTH-word_width);
	}

	$scope.wordStyle = function(word){
		style = {}
		style.top = String(word.Yoffset)+"px";
		style.left = String(word.Xoffset)+"px";
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
})






