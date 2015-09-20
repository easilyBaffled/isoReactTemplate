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
  socket.on("calculateDistance", function (raceMoment) {
    console.log("RACING");
    FAKETIMEITTR += 4;
    var fakeDate = new Date("2015-09-19T16:12:20");
    fakeDate.setSeconds(fakeDate.getSeconds() + FAKETIMEITTR);
    console.log("BEFORE WE START", raceMoment.distance);
    itterace(raceMoment.race, fakeDate, raceMoment.lastIttr, raceMoment.distance, function (itterationData, lastItteration, distanceData) {
      console.log("in the call back");
      var resultData = calculateNewDistance(itterationData, lastItteration, fakeDate, distanceData);
      var distanceData = resultData[0]
      var lastItteration = resultData[1];
      console.log("DISTANCE AGAIN", distanceData)
      console.log("ITTR AGAIN", lastItteration)
      socket.emit('distanceCalculated', {race: raceMoment.race, distance: distanceData, lastPos: lastItteration})
    });
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

var FAKETIMEITTR = 0

function getGPSData (userId, time, callBack) {
  console.log("getGPSData");
  return new Promise(function (resolve, reject) {
    if(userId === "ghost") {
      userId = 2;
      var altTime = time;
      altTime.setMinutes(altTime.getMinutes() + 1);
      console.log("ghost", altTime);
      var url = generateURL(userId, altTime);
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("got data ghost")
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      });
    } else {
      console.log("user");
      var url = generateURL(userId, time);
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("got data for user")
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      });
    }
  });
}

function generateURL (userId, time) {
  console.log("generateURL");
  var startTime = new Date(time);
  var endTime = new Date(time);
  startTime.setSeconds(endTime.getSeconds() - 5);
  return 'http://167.114.68.68:8080/gps/?station='+ userId +'&start='+ startTime.toISOString().replace(/\.\d\d\dZ/g, '').replace(/T/g, '%20') +'&end='+ endTime.toISOString().replace(/\.\d\d\dZ/g, '').replace(/T/g, '%20');
}

function itterace(raceData, newTime, lastItteration, distanceData, callBack) {
  console.log("itterrace");
  var itterationData = []
  _.each([raceData.challenger, raceData.challenged], function (id) {
    getGPSData(id, newTime).then(function (data) {
      itterationData.push({'id': id, 'pos': data[0]});
      if(itterationData.length > 1) {
          console.log("got the data safe and sound");
          console.log("ITTR ", itterationData);
          console.log("LAST ITTR", lastItteration);
          console.log("DISTANCE", distanceData);
          callBack(itterationData, lastItteration, distanceData);
      }
    });
  });
}

function locationConversion(deg, min, sec, dir) {
  console.log(deg, min, sec, dir)
  if(dir === "S" || dir === "W") {
    dir = -1
  } else {
    dir = 1
  }
  return dir * (deg + min/60 + sec/3600);
}

function deg2rad(deg) {
  var rad = deg * Math.PI/180
  return rad
}

function calculateDistance (lat1, lon1, lat2, lon2) {
  console.log("convert lon and lat to mile delta")
  var dlat = deg2rad(lat2) - deg2rad(lat1);
  var dlon = deg2rad(lon2) - deg2rad(lon1);
  var distance = Math.pow(Math.sin(dlat/2),2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.pow(Math.sin(dlon/2), 2);
  var hyp = 2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance))
  var distanceWithMile = 3959*hyp;
  return distanceWithMile;
}

function calculateNewDistance (newItteration, lastItteration, newTime, distanceObj) {
  console.log("calculateNewDistance")
  _.each(newItteration, function (racerObj) {
    var newLong = locationConversion(racerObj.pos.longitude, racerObj.pos.longitudeMin, racerObj.pos.longitudeSec, racerObj.pos.longitudeDirection);
    var newLat = locationConversion(racerObj.pos.latitude, racerObj.pos.latitudeMin, racerObj.pos.latitudeSec, racerObj.pos.latitudeDirection);
    if(lastItteration[racerObj.id] !== 0) {
      console.log("not the first time", racerObj.id)
      console.log("LAST ITTER", lastItteration[racerObj.id])
      var oldLong = lastItteration[racerObj.id].long;
      var oldLat = lastItteration[racerObj.id].lat;

      console.log(distanceObj[racerObj.id]);
      distanceObj[racerObj.id] = distanceObj[racerObj.id] + calculateDistance(newLat, newLong, oldLat, oldLong);
      console.log(distanceObj[racerObj.id]);
    }
    lastItteration[racerObj.id] = {long: newLong, lat: newLat};
    lastItteration.lastTime = newTime;
  });
  return [distanceObj, lastItteration];
}
