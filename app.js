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

  socket.on("join", function(userinfo, response, spawnCords) {

    if(!playerExists(userinfo.username)) {

      playerID = players.length;

      var randomCords = {

        x: Math.floor(Math.random() * 9000) + 10,
        y: Math.floor(Math.random() * 9000) + 10

      };

      players.push({

        socketID: socket.id,
        username: userinfo.username,
        x: randomCords.x,
        y: randomCords.y

      });

      console.log("New player connected: " + players[players.length - 1].username);

      response({

        x: randomCords.x,
        y: randomCords.y

      });

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

  socket.on("mouse", function(mouse) {

    if(playerID === undefined) {

      return;

    }

    players[playerID].x += mouse.x;
    players[playerID].y += mouse.y;

    console.log("New pos: " + players[playerID].x);

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
