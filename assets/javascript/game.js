// Initialize Firebase
var config = {
    apiKey: "AIzaSyCMULJuRutk6Y6FvyO4fn70c6ltHddgYNI",
    authDomain: "rock-paper-scissors-cce8d.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-cce8d.firebaseio.com",
    projectId: "rock-paper-scissors-cce8d",
    storageBucket: "rock-paper-scissors-cce8d.appspot.com",
    messagingSenderId: "10876625240"
};

firebase.initializeApp(config);

//Global Variables
var database = firebase.database();
var numberOfPlayers = database.ref("/numOfPlayers");
var numberofConnections = database.ref(".info/connected");
var allowedPlayers = 2;

var plays = ["Rock", "Paper", "Scissors"];

function displayButtons(player) {
    for (var i = 0; i < plays.length; i++) {
        var newButton = $("<button>");
        newButton.addClass("btn m-2 text-white btn-primary");
        newButton.addClass(player);
        newButton.attr("choice", plays[i]);
        newButton.text(plays[i]);
        newButton.appendTo($("#rpsPlaceholder"));
    }
};

//Chat feature
$("#chatBtn").on("click", function (event) {
    event.preventDefault();
    var message = $("#message").val().trim();
    var messenger = $("#chatBtn").attr("chatName");
    //push message to the database
    database.ref("/messages").push({
        message: message,
        name: messenger,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    //clear message text box
    $("#message").val("");
});

//Listen for chats and add to the page 
database.ref("/messages").orderByChild("dateAdded").on("child_added", function (childSnapshot) {
    var newDiv = $("<div>");
    newDiv.text(childSnapshot.val().name + ": " + childSnapshot.val().message);
    $("#chatPlaceholder").append(newDiv);
});

// When the client's connection state changes...
numberofConnections.on("value", function (snapshot) {
    // If they are connected..
    if (snapshot.val()) {
        // Add user to the connections list.
        var player = numberOfPlayers.push(true);
        // Remove user from the connection list when they disconnect.
        // player.onDisconnect().remove();
    }
});

//when a new user arrives, check to see if there are already two players
numberOfPlayers.once("value", function (snap) {
    if (parseInt(snap.numChildren()) > allowedPlayers) {
        alert("nope");
    }
});

//start the game
$(document).ready(function () {
    $("#enterNameModal").modal('show');
});

//User needs to enter their name
$("#submitName").on("click", function (event) {
    event.preventDefault();
    var name = $("#playerName").val().trim();
    $("#chatBtn").attr("chatName", name);

    //Assign users to game
    database.ref().once("value", function (snapshot) {

        if (!snapshot.child("player1").exists()) {
            database.ref("/player1").set({
                name: name,
                score: 0,
                role: "player1",
                choice: "none"
            });

            $("#pname").text("player 1: " + name)
            displayButtons("player1");
        }
        else if (!snapshot.child("player2").exists()) {
            database.ref("/player2").set({
                name: name,
                score: 0,
                role: "player2",
                choice: "none"
            });

            $("#pname").text("player 2: " + name)
            displayButtons("player2");
        }
        else {
            database.ref("/spectator").push({
                name: name
            });
        }
    });

    $("#enterNameModal").modal('hide');
});

//Display Score
database.ref().on("value", function (snapshot) {
    $("#scorePlaceholder").empty();
    var Player1 = snapshot.val().player1.name;
    var player1Points = snapshot.val().player1.score;
    var Player2 = snapshot.val().player2.name;
    var player2Points = snapshot.val().player1.score;

    var p1Score = $("<div>");
    var p2Score = $("<div>");
    p1Score.text(Player1 + "(Player 1): " + player1Points);
    p2Score.text(Player2 + "(Player 2): " + player2Points);

    $("#scorePlaceholder").append(p1Score);
    $("#scorePlaceholder").append(p2Score);

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//Player one makes their choice
$(document.body).on("click", ".player1", function () {
    var p1choice = $(this).attr("choice");
    database.ref("/player1").update({
        choice: p1choice
    });
    $("#rpsPlaceholder").empty();
    $("#rpsPlaceholder").text("Wait for it...");
});

//Player two  makes their choice
$(document.body).on("click", ".player2", function () {
    var p2choice = $(this).attr("choice");
    database.ref("/player2").update({
        choice: p2choice
    });
    $("#rpsPlaceholder").empty();
    $("#rpsPlaceholder").text("Wait for it...");
});

//listen for choices to be made and determine the winner
database.ref().on("value", function (snapshot) {
    //could check to see if players exist yet...
    var player1Choice = snapshot.val().player1.choice;
    var player2Choice = snapshot.val().player2.choice;

    if (player1Choice !== "none" && player2Choice !== "none") {
        if (player1Choice === player2Choice) {
            alert("it's a tie!!");
        }
        else if ((player1Choice == "Rock" && player2Choice == "Scissors") || (player1Choice == "Scissors" && player2Choice == "Paper") || (player1Choice == "Paper" && player2Choice == "Rock")) {
            alert("player 1 wins!");
        }
        else {
            alert("player 2 wins!");
        }
    }
});


//    //set total points from snapshot
//    database.ref().on("value", function (snapshot) {
//     if (snapshot.child("totalPoints").exists()) {
//     getReady.totalPoints = snapshot.val().totalPoints;

    //}
//}); 