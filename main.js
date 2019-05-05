var socket = io();
var gameCanvas = document.getElementById("game");
var gameContent = gameCanvas.getContext("2d");

socket.on("packetToClient", function(data) {

  console.log(data.die);

});

var username = "";
var mouse = {x: 0, y: 1};
var player = {x: 0, y: 0, alive: false, id: 0, size: 0};

jQuery(function($) {

  $(document).ready(function() {

    $(window).trigger("resize");
    drawPlayer($(window).width() / 2, $(window).height() / 2, "#ff0000", 15, "You");

  });

  $(window).on("resize", function() {

    $("#game").attr("width", $(window).width());
    $("#game").attr("height", $(window).height());

  });

  $(document).mousemove(function(e) {

    mouse.x = e.pageX;
    mouse.y = e.pageY;

  });

  $(".join-modal .container button").click(function() {

    var requestUsername = $(this).parent().find("input[type=text]").val();

    socket.emit("join", {

      username: requestUsername

    }, function(response) {

      if(response.constructor !== Boolean) {

        $(".join-modal").remove();
        username = requestUsername;
        player.x = response.x;
        player.y = response.y;
        player.alive = true;
        player.id = response.id;
        player.size = response.size;

      }else {

        $(".join-modal .container .error").html("Could not connect. Try another username!");

      }

    });

  });

  setInterval(function() {

    socket.emit("mouse", {

      x: mouse.x - ($(window).width() / 2),
      y: mouse.y - ($(window).height() / 2)

    });

  }, 1000 / 60);

  socket.on("players", function(players, food) {

    gameContent.clearRect(0, 0, $(gameCanvas).attr("width"), $(gameCanvas).attr("height"));
    drawCourt($(gameCanvas).attr("width") / 2 - player.x, $(gameCanvas).attr("height") / 2 - player.y);

    for(var i = 0; i < food.length; i++) {

      gameContent.beginPath();
      gameContent.arc($(gameCanvas).attr("width") / 2 - player.x + food[i].x, $(gameCanvas).attr("height") / 2 - player.y + food[i].y, 6, 0, 2 * Math.PI);
      gameContent.fillStyle = "#ff8cf7";
      gameContent.fill();

    }

    for(var i = 0; i < players.length; i++) {

      if(typeof players[i] === "undefined" || players[i] == null || !players[i].alive) {

        continue;

      }

      if(players[i].username != username) {

        drawPlayer($(gameCanvas).attr("width") / 2 - player.x + players[i].x, $(gameCanvas).attr("height") / 2 - player.y + players[i].y, "#000", players[i].size, players[i].username);

      }else if(player.alive) {

        player.x = players[i].x;
        player.y = players[i].y;
        player.id = i;
        player.size = players[i].size;

      }

    }

    if(player.alive) {

      var topPlayerID;

      for(var i = 0; i < players.length; i++) {

        if(topPlayerID === undefined) {

          topPlayerID = i;

        }else if(players[i].size > players[topPlayerID].size) {

          topPlayerID = i;

        }

      }

      drawPlayer($(window).width() / 2, $(window).height() / 2, "#ff0000", players[player.id].size, players[player.id].username);

      gameContent.fillStyle = "#000";
      gameContent.font = "14px Arial";
      gameContent.fillText("X: " + Math.floor(player.x) + " Y: " + Math.floor(player.y), $(window).width() - (gameContent.measureText("X: " + Math.floor(player.x) + " Y: " + Math.floor(player.y)).width) - 5, 16);
      gameContent.fillText("Score: " + player.size, $(window).width() - (gameContent.measureText("Score: " + player.size).width) - 5, 32);
      gameContent.fillText("Top player: " + players[topPlayerID].username, $(window).width() - (gameContent.measureText("Top player: " + players[topPlayerID].username).width) - 5, 48);

    }

  });

  socket.on("death", function(deathID) {

    if(player.id != deathID) {

      return;

    }

    if(document.getElementsByClassName("join-modal").length != 0) {

      return;

    }

    $("body").append('<div class="join-modal"><div class="container">You died! Refresh the page to rejoin!</div></div>');
    player.alive = false;

  });

});

function drawPlayer(x, y, color, size, name) {

  gameContent.beginPath();
  gameContent.arc(x, y, size, 0, 2 * Math.PI);
  gameContent.fillStyle = color;
  gameContent.fill();
  gameContent.fillStyle = color == "#000" ? "#fff" : "#000";
  gameContent.font = "10px Arial";
  gameContent.fillText(name, x - (gameContent.measureText(name).width / 2), y + 5);

}

function drawCourt(x, y) {

  for(var i = 0; i < (10020 / 20); i++) {

    gameContent.fillStyle = "#b7b7b7";
    gameContent.fillRect(x, y + i * 20, 10000, 1);
    gameContent.fillRect(x + i * 20, y, 1, 10000);

  }

  gameContent.fillStyle = "#b7b7b7";
  gameContent.fillRect(9999, 0, 1, 10000);
  gameContent.fillRect(0, 9999, 10000, 1);

}
