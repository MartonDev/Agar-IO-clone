var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server, {});

var port = 8000;

app.get("/", function(req, res) {

  res.sendFile(__dirname + "/index.html");

});

app.use("", express.static(__dirname));

server.listen(port, function() {

  console.log("Starting server...");
  console.log("Listening on:" + port);

});

var players = [];

io.sockets.on("connection", function(socket) {

  console.log("New connection. ID: " + socket.id);

  var playerID;

  socket.on("join", function(userinfo, response) {

    if(!playerExists(userinfo.username)) {

      playerID = players.length;

      players.push({

        socketID: socket.id,
        username: userinfo.username,
        x: 0,
        y: 0

      });

      console.log("New player connected: " + players[players.length - 1].username);

      response(true);

    }else {

      response(false);

    }

  });

  setInterval(function() {

    socket.emit("players", players);

  }, 1000 / 60);

  socket.on("disconnect", function() {

    for(var i = 0; i < players.length; i++) {

      if(players[i].socketID == socket.id) {

        players.splice(i, 1);

      }

    }

  });

  socket.on("keydown", function(keycode) {

    if(playerID === undefined) {

      return;

    }

    switch(keycode) {

      case 87: //w

        players[playerID].y -= 6;

        break;

      case 65: //a

        players[playerID].x -= 6;

        break;

      case 68: //d

        players[playerID].x += 6;

        break;

      case 83: //s

        players[playerID].y += 6;

        break;

    }

  });

});

function playerExists(username) {

  for(var i = 0; i < players.length; i++) {

    if(players[i].username == username) {

      return true;

    }

  }

  return false;

}
