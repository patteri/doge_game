/* JavaScripts for Doge game! Wow! */

var app = angular.module('doge', []);

app.controller('dogeCtrl', ['$scope', '$http', 'dogeCanvas', function ($scope, $http, dogeCanvas) {
    // Locations of partial views
    var partials = {'continue': 'partial_continue.html', 'submit': 'partial_submit.html', 'topscores': 'partial_topscores.html'};
    // Location of server
    var serverAddress = 'doge_server.php';
    
    var words = [];
    var wordIndex;
    
    var pressedChars;
    var score;
    var maxFouls = 6;

    var gameRunning;
       
    // Initializes and starts the game
    var initializeGame = function() {
        $scope.dogeText = '"Let\'s play a game!"';
        score = 0;
        wordIndex = -1;
        dogeCanvas.refresh();
        $http.get(serverAddress).success(function(data) {
            words = data;
            startGame();
        });
    };
    
    initializeGame();
    
    // Starts the game and increases word index
    var startGame = function() {
        $scope.partial = "";
        gameRunning = true;
        ++wordIndex;
        pressedChars = [];
        $scope.fouls = [];
        
        printCurrentWord();
    };
    
    // Stops the current game
    // gameEnded: true, if the whole game ended
    function stopGame(gameEnded) {
        gameRunning = false;
        if (gameEnded) {
            showSubmitForm();
        } else {
            $scope.partial = partials["continue"];
        }
    };
    
    // Prints the current word by replacing unpressed chars with '_'
    var printCurrentWord = function() {
        var output = ' ' + words[wordIndex].replace(/ /g, '  '); // Widen the spaces in the output
        var current = words[wordIndex].replace(' ', '').replace(/(.)(?=.*\1)/g, ""); // Replace spaces and duplicates in the word to iterate
        for (i = 0; i < current.length; i++) {
            var curChar = current[i];
            var replace = $.inArray(curChar, pressedChars) == -1 ? '_ ' : curChar + ' ';
            output = output.replace(new RegExp(curChar, 'g'), replace);
        }
        
        $scope.word = output;
        return output;
    };
    
    var showSubmitForm = function() {
        $scope.partial = partials["submit"];
    };
   
    $scope.more = function() {
        // Next word
        startGame();
    };
    
    $scope.nomore = function() {
        showSubmitForm();
    };
    
    $scope.submit = function() {
        var playerName = $scope.playerName.trim();
        $scope.playerName = "";
    
        // Post results to the server
        var data = {"player" : playerName, "score" : score};
        $http.post(serverAddress, data).success(function(data) {
            // Build top scores
            $scope.scores = [];
            for (i = 0; i < data.length; i++) {
               var cur = data[i];
               var temp = {'date': cur[0], 'player': cur[1], 'scores': cur[2]};
               $scope.scores.push(temp);
            }

            $scope.partial = partials["topscores"];
        });
    };
    
    $scope.newGame = function() {
        // Restart the game
        initializeGame();
    };
   
    // Key press handler
    $scope.keyPress = function($event) {
        if (gameRunning) {
            // Accept only chars a - z
            if ($event.which >= 65 && $event.which <= 90 || $event.which >= 97 && $event.which <= 122) {
                $event.preventDefault();
                
                var pressedChar = String.fromCharCode($event.which).toLowerCase();
                if ($.inArray(pressedChar, pressedChars) == -1) { // Key not already pressed?     
                    pressedChars.push(pressedChar);
                    if (words[wordIndex].indexOf(pressedChar) != -1) {
                        score += 5;
                        var output = printCurrentWord();
                        
                        // Game ended?
                        if (output.indexOf('_') == -1) {
                            score += 10;
                            dogeCanvas.printDogeText(words[wordIndex]);
                            stopGame(wordIndex == words.length - 1);
                        }
                    } else {
                        score -= 2;
                        $scope.fouls.push(pressedChar);
                        
                        // Game ended?
                        if ($scope.fouls.length == maxFouls) {
                            stopGame(true);
                        }
                    }
                    
                    $scope.dogeText = 'Skore: ' + score;
                }
            }
        }
    };
}]);

app.factory('dogeCanvas', function() {
    var colors = ["red", "green", "blue", "yellow", "lime", "orange", "purple"]; // Doge colors

    // Init drawing canvas
    var canvas = document.getElementById("dogeCanvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;
    var background = new Image();
    background.src = "doge.jpg";
    background.onload = function() {
        dogeCanvas.refresh();
    };
    
    var dogeCanvas = {
        // Refreshes the doge canvas by redrawing the doge pic
        refresh: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        },
        
        // Prints such cool doge text!
        printDogeText: function(text) {
            ctx.font = "30px comic sans ms, sans-serif";
            ctx.fillStyle = colors[Math.floor(Math.random() * (colors.length - 1))];
            var x = Math.random() * (canvas.width - 130) + 5;
            var y = Math.random() * (canvas.height - 30) + 15;
            ctx.fillText(text, x, y);
        }
    };
    
    return dogeCanvas;
});