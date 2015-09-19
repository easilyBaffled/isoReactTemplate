'use strict';

// make `.jsx` file requirable by node
require('node-jsx').install();

var path = require('path'),
    express = require('express'),
    renderer = require('react-engine'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    User = require('./app/models/user'),
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
  socket.on('submitChallenge', function (data) {
      User.getUser(data.id, function (user) {
          socket.broadcast.to(user.socketID).emit('Challenged', data.challengerID);
      });
  });
  socket.on("challengeDeclined", function (challengerID) {
    User.getUser(challengerID, function (user) {
        socket.broadcast.to(user.socketID).emit('challengeDeclined');
    });
  });
  socket.on("challengeAccepted", function () {
    io.sockets.emit("RACE");
  });
});
