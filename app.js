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
        y: randomCords.y,
        speed: 2.5,
        size: Math.floor(Math.random() * 15) + 10,
        alive: true

      });

      console.log("New player connected: " + players[players.length - 1].username);

      response({

        x: randomCords.x,
        y: randomCords.y,
        id: playerID,
        size: players[playerID].size

      });

    }else {

      response(false);

    }

  });

  socket.on("tp", function(data) {

    for(var i = 0; i < players.length; i++) {

      if(players[playerID].alive) {

        players[i].x = data.x;
        players[i].y = data.y;

      }

    }

  });

  socket.on("disconnect", function() {

    players[playerID].alive = false;

  });

  socket.on("mouse", function(mouse) {

    if(playerID === undefined || players[playerID]  === undefined || !players[playerID].alive) {

      return;

    }

    var percentage = (players[playerID].speed / Math.sqrt((mouse.x * mouse.x) + (mouse.y * mouse.y))) * 100;

    players[playerID].x += (mouse.x / 100) * percentage;
    players[playerID].y += (mouse.y / 100) * percentage;

  });

});

setInterval(function() {

  io.emit("players", players);

  for(var i = 0; i < players.length; i++) {

    if(players[i].alive) {

      if(players[i].x < 0 || players[i].x > 10000 || players[i].y < 0 || players[i].y > 10000) {

        io.emit("death", i);
        players[i].alive = false;

      }else {

        for(var j = 0; j < players.length; j++) {

          if(j != i && players[j].alive && isColliding(players[i].x, players[i].y, players[i].size, players[j].x, players[j].y, players[j].size)) {

            if(players[i].size == players[j].size) {

              players[i].alive = false;
              io.emit("death", i);
              players[j].alive = false;
              io.emit("death", j);

            }else {

              var collidingItems = {

                smaller: players[i].size > players[j].size ? j : i,
                bigger: players[i].size > players[j].size ? i : j

              };

              io.emit("death", collidingItems.smaller);
              players[collidingItems.smaller].alive = false;
              players[collidingItems.bigger].size += players[collidingItems.smaller].size;

            }

          }

        }

      }

    }

  }

}, 1000 / 60);

setInterval();

function playerExists(username) {

  for(var i = 0; i < players.length; i++) {

    if(players[i].username == username && players[i].alive) {

      return true;

    }

  }

  return false;

}

function isColliding(p1x, p1y, r1, p2x, p2y, r2) {

  var a;
  var x;
  var y;

  a = r1 + r2;
  x = p1x - p2x;
  y = p1y - p2y;

  if(a > Math.sqrt((x * x) + (y * y))) {

    return true;

  }else {

    return false;

  }

}
