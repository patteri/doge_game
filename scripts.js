/* JavaScripts for Doge game! Wow! */

var colors = ["red", "green", "blue", "yellow", "lime", "orange", "purple"]; // Doge colors

var words = [];
var currentWord;
var pressedChars;
var score;
var fouls;
var maxFouls = 6;

var gameRunning;
var index;

// Init drawing canvas
var canvas = document.getElementById("dogeCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;
var background = new Image();
background.src = "doge.jpg";
background.onload = function() {
    initialize();
};

// More-button handler
$("#button_more").on("click", function() {
    // Next word
    startGame();
});

// Nomore-button handler
$("#button_nomore").on("click", function() {
    $("#continue_controls").hide();
    showSubmitForm();
});

// Submit-button handler
$("#button_submit").on("click", function() {
    // Construct the results and post to server
    var data = {"player" : getPlayerName(), "score" : score};
    $.post('doge_server.php', { submit_score : JSON.stringify(data) } )
    .done(function(data) {
        // Show top score
        var results = jQuery.parseJSON(data);
        var scores = "";
        for (i = 0; i < results.length; i++) {
           var cur = results[i];
           scores += (i + 1) + ". " + tabify(cur[0]) + tabify(cur[1]) + cur[2] + "\n";
        }
        
        $("#scores").text(scores);
        $("#submit_form").hide();
        $("#score_area").show();
        $("#button_newgame").focus();
    });
});

// Again-button handler
$("#button_again").on("click", function() {
    // Restart the game
    initialize();
});

// New game button handler
$("#button_newgame").on("click", function() {
    $("#score_area").hide();
    // Restart the game
    initialize();
});

// Name input keypress handler
$("#input_name").on("input", function() {
    validateSubmitButton();
});

// Key press handler
$("html").keypress(function(e) {
    if (gameRunning) {
        // Accept only chars a - z
        if (e.which >= 65 && e.which <= 90 || e.which >= 97 && e.which <= 122) {
            var pressedChar = String.fromCharCode(e.which).toLowerCase();
            if ($.inArray(pressedChar, pressedChars) == -1) { // Key not already pressed?     
                pressedChars.push(pressedChar);
                if (currentWord.indexOf(pressedChar) != -1) {
                    score += 5;
                    var output = printCurrentWord();
                    
                    // Game ended?
                    if (output.indexOf('_') == -1) {
                        score += 10;
                        printDogeText(currentWord);
                        stopGame(index == words.length - 1);
                    }
                } else {
                    score -= 2;
                    fouls.push(pressedChar);
                    $("#fouls").html(fouls);
                    
                    // Game ended?
                    if (fouls.length == maxFouls) {
                        stopGame(true);
                    }
                }
                
                $("#doge").text('Score: ' + score);
            }
        }
    }
});

// Initializes and starts the game
function initialize() {
    $.get('doge_server.php').done(function(data) {
        words = jQuery.parseJSON(data);
        score = 0;
        index = -1;
        $("#doge").text('"Let\'s play a game!"'); // Hello text
        refreshCanvas();
        startGame();
    });
}

// Starts the game and increases word index
function startGame() {
    gameRunning = true;
    ++index;
    pressedChars = [];
    fouls = [];
    currentWord = words[index];
    
    $("#fouls").html(fouls);
    $("#continue_controls").hide();
    $("#submit_form").hide();
    $("#score_area").hide();
    
    printCurrentWord();
}

// Stops the current game
// gameEnded: true, if the whole game ended
function stopGame(gameEnded) {
    gameRunning = false;
    if (gameEnded) {
        showSubmitForm();
    } else {
        $("#continue_controls").show();
        $("#button_more").focus();
    }
}

// Refreshes the canvas with such cool doge pic!
function refreshCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

// Prints the current word by replacing unpressed chars with '_'
function printCurrentWord() {
    var output = ' ' + currentWord.replace(/ /g, '  '); // Widen the spaces in the output
    var current = currentWord.replace(' ', '').replace(/(.)(?=.*\1)/g, ""); // Replace spaces and duplicates in the word to iterate
    for (i = 0; i < current.length; i++) {
        var curChar = current[i];
        var replace = $.inArray(curChar, pressedChars) == -1 ? '_ ' : curChar + ' ';
        output = output.replace(new RegExp(curChar, 'g'), replace);
    }
    
    $("#word").text(output);
    return output;
}

// Prints such cool doge text!
function printDogeText(text) {
    ctx.font="30px comic sans ms, sans-serif";
    ctx.fillStyle = colors[Math.floor(Math.random() * (colors.length - 1))];
    var x = Math.random() * (canvas.width - 130) + 5;
    var y = Math.random() * (canvas.height - 30) + 15;
    ctx.fillText(currentWord, x, y);
}

// Shows the submit form
function showSubmitForm() {
    validateSubmitButton();
    $("#submit_form").show();
    $("#input_name").focus();
}

// Gets the player name from the input field
function getPlayerName() {
    return $("#input_name").val().trim();
}

// Validates the submit button
function validateSubmitButton() {
    $("#button_submit").prop("disabled", getPlayerName() === "");
}

// Adds tabs after specified text
// text: the text to tabify
function tabify(text) {
    var result = text;
    var limit = 3 - Math.ceil(text.length / 8);
    for (j = 0; j < limit; j++) {
        result += "\t";
    }
    return result;
}