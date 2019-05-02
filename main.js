var socket = io();
var gameCanvas = document.getElementById("game");
var gameContent = gameCanvas.getContext("2d");

socket.on("packetToClient", function(data) {

  console.log(data.die);

});

var username = "";
var mouse = {x: 0, y: 1};
var player = {x: 0, y: 0};

jQuery(function($) {

  $(document).ready(function() {

    $(window).trigger("resize");
    drawPlayer($(window).width() / 2, $(window).height() / 2, "#ff0000");

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

  }, 1000 / 55);

  socket.on("players", function(players) {

    gameContent.clearRect(0, 0, $(gameCanvas).attr("width"), $(gameCanvas).attr("height"));
    drawCourt($(gameCanvas).attr("width") / 2 - player.x, $(gameCanvas).attr("height") / 2 - player.y);

    for(var i = 0; i < players.length; i++) {

      if(players[i].username != username) {

        drawPlayer($(gameCanvas).attr("width") / 2 - player.x + players[i].x, $(gameCanvas).attr("height") / 2 - player.y + players[i].y, "#000");

      }else {

        player.x = players[i].x;
        player.y = players[i].y;

      }

    }

    drawPlayer($(window).width() / 2, $(window).height() / 2, "#ff0000");

  });

});

function drawPlayer(x, y, color) {

  gameContent.beginPath();
  gameContent.arc(x, y, 10, 0, 2 * Math.PI);
  gameContent.fillStyle = color;
  gameContent.fill();

}

function drawCourt(x, y) {

  for(var i = 0; i < (10000 / 20); i++) {

    gameContent.fillStyle = "#b7b7b7";
    gameContent.fillRect(x, y + i * 20, 10000, 1);
    gameContent.fillRect(x + i * 20, y, 1, 10000);

  }

}
