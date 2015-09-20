'use strict';

// make `.jsx` file requirable by node
require('node-jsx').install();

var path = require('path'),
promise = require('promise'),
_ = require('lodash'),
request = require("request"),
express = require('express'),
renderer = require('react-engine'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
User = require('./app/models/user'),
Race = require('./app/models/race'),
morgan  = require('morgan'),
http = require('http'),
socketIO = require('socket.io').listen(3000),
debug = require('./debug.js');
mongoose.connect('mongodb://dmichaelis0:Baffled00@ds031581.mongolab.com:31581/heroku_app33289668', function (err){
  if(err){console.log("err", err)} else {console.log("mongoose working")}
});
var app = express();

app.use(morgan('dev'));
// create the view engine with `react-engine`

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
var engine = renderer.server.create({
  routes: require(path.join(__dirname + '/public/routes.jsx')),
  routesFilePath: path.join(__dirname + '/public/routes.jsx')
});

app.engine('.jsx', engine);

app.set('views', __dirname + '/public/views');

app.set('view engine', 'jsx');

app.set('view', renderer.expressView);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render(req.url, {});
});

// 404 template
app.use(function(req, res) {
  res.render('404', {
    title: 'React Engine Express Sample App',
    url: req.url
  });
});

var server =  http.createServer(app).listen(3001, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var io = socketIO.listen(server);
io.on('connection', function (socket) {
  socket.on('logIn', function (data) {
    User.logInUser(data.id, socket.id, function (user) {
      socket.emit('loggedIn', user);
    });
  });
  socket.on('submitChallenge', function (raceData) {
    User.getUser(raceData.challenged, function (user) {
      Race.createRace(raceData.challenger, raceData.challenged, raceData.raceDistance, function (race) {
        socket.broadcast.to(user.socketID).emit('Challenged', race);
        socket.emit("raceCreated", race);
      });
    });
  });
  socket.on('challengeGhost', function (raceData) {
    Race.createRace(raceData.challenger, raceData.challenged, raceData.raceDistance, function (race) {
      socket.emit("raceCreated", race);
      setTimeout(function(){
        console.log("ready!!!")
        socket.emit("readyUp", race);
      }, 100);
    });
  });
  socket.on("challengeDeclined", function (challengerID) {
    User.getUser(challengerID, function (user) {
      socket.broadcast.to(user.socketID).emit('challengeDeclined');
    });
  });
  socket.on("challengeAccepted", function (race) {
    io.sockets.emit("readyUp");
  });
  socket.on("startRaceTracking", function (race) {
    console.log("RACING");
    //trackRace(race, new Date());
  });
  socket.on("ready", function (raceID) {
    Race.readyUp(raceID, function (race) {
      console.log(race);
      if(race.challenged === 'ghost' || race.readyCount > 1) {
        var startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + 8);
        startTime = startTime.getTime();
        console.log("startTime", startTime)
        Race.setRaceTime(raceID, startTime, function (race) {
          io.sockets.emit("start", race);
        });
      }
    })
  })
});
function getGPSData (userId, time, callBack) {
  return new Promise(function (resolve, reject) {
    if(userId === "ghost") {
      resolve([{"id":1,"station":1,"latitude":39.0,"latitudeMin":17.0,"latitudeSec":14.01,"latitudeDirection":"N","longitude":76.0,"longitudeMin":35.0,"longitudeSec":7.51,"longitudeDirection":"W","created":"2015-03-19T00:10:52.787455Z","owner":"Brian"}]);
    } else {
      var url = generateURL(userId, time);
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      });
    }
  });
}
function generateURL (userId, time) {
  var startTime = new Date(time);
  var endTime = new Date(time);
  startTime.setSeconds(endTime.getSeconds() - 4);
  return 'http://167.114.68.68:8080/gps/?station='+ userId +'&start='+ startTime.toISOString().replace(/\.\d\d\dZ/g, '').replace(/T/g, '%20') +'&end='+ endTime.toISOString().replace(/\.\d\d\dZ/g, '').replace(/T/g, '%20');
}

function trackRace(race, time) {
  var lastItteration = {lastTime: time}
  lastItteration[race.challenger] = 0; //last position
  lastItteration[race.challenged] = 0;
  var distanceData = {}
  distanceData[race.challenger] = 0; //last position
  distanceData[race.challenged] = 0;

  itterace(race, time, function (itterationData) {
    var resultData = calculateNewDistance(itterationData, lastItteration, time);
    console.log(resultData)
    distanceData[race.challenger] = resultData[0][race.challenger];
    distanceData[race.challenged] = resultData[0][race.challenged];
    lastItteration = resultData[1];

    time = new Date('2015-09-19T16:16:30')
    itterace(race, time, function (itterationData) {
      var resultData = calculateNewDistance(itterationData, lastItteration, time);
      console.log(resultData)
      distanceData[race.challenger] = resultData[0][race.challenger];
      distanceData[race.challenged] = resultData[0][race.challenged];
      lastItteration = resultData[1];
      console.log("END ======================");
      console.log(JSON.stringify(distanceData));
    });
  });
}

function itterace(raceData, newTime, callBack) {
  var itterationData = []
  _.each([raceData.challenger, raceData.challenged], function (id) {
    getGPSData(id, newTime).then(function (data) {
      itterationData.push({'id': id, 'pos': data[0]});
      if(itterationData.length > 1) {
        callBack(itterationData, newTime);
      }
    });
  });
}

function locationConversion(deg, min, sec, dir) {
  if(dir === "S" || dir === "W") {
    dir = -1
  } else {
    dir = 1
  }
  return dir * (deg + min/60 + sec/3600);
}

function calculateNewDistance (newItteration, lastItteration, newTime) {
  console.log("calculating")
  var distanceObj = {};
  _.each(newItteration, function (racerObj) {
    var newLong = locationConversion(racerObj.pos.longitude, racerObj.pos.longitudeMin, racerObj.pos.longitudeSec, racerObj.pos.longitudeDirection);
    var newLat = locationConversion(racerObj.pos.latitude, racerObj.pos.latitudeMin, racerObj.pos.latitudeSec, racerObj.pos.latitudeDirection);
    if(lastItteration[racerObj.id] === 0) {
      distanceObj[racerObj.id] = 0;
    } else {
      var oldLong = lastItteration[racerObj.id].long;
      var oldLat = lastItteration[racerObj.id].lat;
      distanceObj[racerObj.id] = {longDelta: newLong-oldLong, latDelta: newLat-oldLat};
    }
    lastItteration[racerObj.id] = {long: newLong, lat: newLat};
    lastItteration.lastTime = newTime;
  });
  return [distanceObj, lastItteration];
}

trackRace({challenger: 1, challenged: 2}, new Date('2015-09-19T16:12:23'));
