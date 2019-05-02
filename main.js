var socket = io();
var gameCanvas = document.getElementById("game");
var gameContent = gameCanvas.getContext("2d");

socket.on("packetToClient", function(data) {

  console.log(data.die);

});

var username = "";
var keysdown = [];

jQuery(function($) {

  $(".join-modal .container button").click(function() {

    var requestUsername = $(this).parent().find("input[type=text]").val();

    socket.emit("join", {

      username: requestUsername

    }, function(response) {

      if(response) {

        $(".join-modal").remove();
        username = requestUsername;
        drawPlayer(0, 0, "#00ffff");

      }else {

        $(".join-modal .container .error").html("Could not connect. Try another username!");

      }

    });

  });

  $("body").keydown(function(e) {

    if(!keysdown.includes(e.which)) {

      keysdown.push(e.which);

    }

  });

  $("body").keyup(function(e) {

    keysdown.splice(keysdown.indexOf(e.which), 1);

  });

  setInterval(function() {

    for(var i = 0; i < keysdown.length; i++) {

      socket.emit("keydown", keysdown[i]);

    }

  }, 1000 / 55);

  socket.on("players", function(players) {

    gameContent.clearRect(0, 0, 500, 500);

    for(var i = 0; i < players.length; i++) {

      drawPlayer(players[i].x, players[i].y, players[i].username == username ? "#00ffff" : "#000");

    }

  });

});

function drawPlayer(x, y, color) {

  gameContent.beginPath();
  gameContent.arc(x, y, 10, 0, 2 * Math.PI);
  gameContent.fillStyle = color;
  gameContent.fill();

}
