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
var numberOfConnections = database.ref(".info/connected");
var allowedPlayers = 2;
var plays = ["Rock", "Paper", "Scissors"];
var playerId = 0; 

function displayButtons(player) {
    $("#rpsPlaceholder").empty();
    for (var i = 0; i < plays.length; i++) {
        var newButton = $("<button>");
        newButton.addClass("btn m-2 text-white btn-primary");
        newButton.addClass(player);
        newButton.attr("choice", plays[i]);
        newButton.text(plays[i]);
        newButton.appendTo($("#rpsPlaceholder"));
    }
};

//Chat Feature
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

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//DO I NEED THIS STILL???  if so, add error thing for read. 
// When the client's connection state changes...

// numberOfConnections.on("value", function (snapshot) {
//  if (!snapshot.val()) {
//      if ((playerId === "1") || (playerId === "2")) {
//         database.ref("/player" + playerId).remove(); 
//      }
    
//  }
// });
    // If they are connected..
    // if (snapshot.val()) {
    //     // Add user to the connections list.
    //     var player = numberOfPlayers.push(true);
    //     // Remove user from the connection list when they disconnect.
    //     player.onDisconnect().remove();
    // }
//});
//SAME HERE
//when a new user arrives, check to see if there are already two players
// numberOfPlayers.once("value", function (snap) {
//     if (parseInt(snap.numChildren()) > allowedPlayers) {
//         alert("nope");
//     }
// });

//start the game by showing a modal for user to enter their name
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
                choice: "none",
            });
            database.ref("/player1").onDisconnect().remove();

            playerId = "1"; 
            $("#pname").text("Player 1: " + name)
            displayButtons("player1");
            sessionStorage.setItem("role", "player1");
        }
        else if (!snapshot.child("player2").exists()) {
            database.ref("/player2").set({
                name: name,
                score: 0,
                role: "player2",
                choice: "none"
            });

            database.ref("/player2").onDisconnect().remove();

            playerId = "2"; 
            $("#pname").text("Player 2: " + name)
            displayButtons("player2");
            sessionStorage.setItem("role", "player2");
        }
        else {
            database.ref("/spectator").push({
                name: name
            });
            
           // var key = database.ref().child("spectator").push().getKey();
           // database.ref().child("spectator").child(key).remove(); // This is how you remove it

            //database.ref("/spectator/").onDisconnect().remove();

            $("#pname").text("Sorry " + name + ", but you'll have to wait your turn...  The game is already in progress.");
            sessionStorage.setItem("role", "spectator");
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    $("#enterNameModal").modal('hide');
});

//Display Score
database.ref().on("value", function (snapshot) {
    //Make sure the players exist before checking their score
    if (snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
    $("#scorePlaceholder").empty();
    var player1 = snapshot.val().player1.name;
    var player1Points = snapshot.val().player1.score;
    var player2 = snapshot.val().player2.name;
    var player2Points = snapshot.val().player2.score;

    var p1Score = $("<div>");
    var p2Score = $("<div>");
    p1Score.text(player1 + "(Player 1): " + player1Points);
    p2Score.text(player2 + "(Player 2): " + player2Points);

    $("#scorePlaceholder").append(p1Score);
    $("#scorePlaceholder").append(p2Score);
    }
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
    //Make sure the players exist before checking their choice
    if (snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
        var player1Choice = snapshot.val().player1.choice;
        var player1Name = snapshot.val().player1.name;

        var player2Choice = snapshot.val().player2.choice;
        var player2Name = snapshot.val().player2.name;

        var result = ""; 

        if (player1Choice !== "none" && player2Choice !== "none") {
            //tie
            if (player1Choice === player2Choice) {
                result = "It's a tie!!"
            }
            //player 1 wins
            else if ((player1Choice == "Rock" && player2Choice == "Scissors") || (player1Choice == "Scissors" && player2Choice == "Paper") || (player1Choice == "Paper" && player2Choice == "Rock")) {
                var p1Score = snapshot.val().player1.score + 1;

                database.ref("/player1").update({
                    score: p1Score,
                    choice: "none"
                });

                database.ref("/player2").update({
                    choice: "none"
                });
                
                result = player1Name + " wins!";
            }
            //player 2 wins
            else {
                var p2Score = snapshot.val().player2.score + 1;
                database.ref("/player2").update({
                    score: p2Score,
                    choice: "none"
                });
                
                database.ref("/player1").update({
                    choice: "none"
                });
                
                result = player2Name + " wins!";
            };
        
        //Show the result of who won/lost
        $("#theResult").empty(); 
        var choicesDiv = $("<div>")
        choicesDiv.html(player1Name + ": " + player1Choice + "<br>" + player2Name + ": " + player2Choice + "<br>")
        choicesDiv.addClass("lead")

        var resultHdr = $("<h3>")
        resultHdr.html(result);
        $("#theResult").append(choicesDiv); 
        $("#theResult").append(resultHdr);
        $("#showResultModal").modal('show');
        }
    }
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

$("#closeResult").on("click", function (event) {
    event.preventDefault();
    $("#showResultModal").modal('hide');

    var playerRole = sessionStorage.getItem("role"); 
    if (playerRole !== "spectator") {
        displayButtons(playerRole); 
    }
}); 

//    //set total points from snapshot
//    database.ref().on("value", function (snapshot) {
//     if (snapshot.child("totalPoints").exists()) {
//     getReady.totalPoints = snapshot.val().totalPoints;

    //}
//}); 