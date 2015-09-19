'use strict';

// make `.jsx` file requirable by node
require('node-jsx').install();

var path = require('path'),
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
  socket.on("challengeDeclined", function (challengerID) {
    User.getUser(challengerID, function (user) {
      socket.broadcast.to(user.socketID).emit('challengeDeclined');
    });
  });
  socket.on("challengeAccepted", function (race) {
    io.sockets.emit("readyUp");
  });
  socket.on("startRaceTracking", function (race) {
    trackRace(race, new Date());
  });
  socket.on("ready", function (raceID) {
    Race.readyUp(raceID, function (race) {
      if(race.readyCount > 1) {
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
  var url = generateURL(userId, time);
  console.log(url)
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callBack(JSON.parse(body));
    } else {
      console.log("SOMETHING BROKE")
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
  getGPSData(2, new Date('2015-09-19T16:12:23'), function (data) {
    console.log(data);
  });
}
trackRace('', '');
