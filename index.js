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
    socketIO = require('socket.io').listen(3000);
mongoose.connect('MONGO LAB CONNECTION', function (err){
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

// set the engine
app.engine('.jsx', engine);

// set the view directory
app.set('views', __dirname + '/public/views');

// set jsx as the view engine
app.set('view engine', 'jsx');

// finally, set the custom view
app.set('view', renderer.expressView);

//expose public folder as static assets
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
      User.getUser(data.id, data.name, function (user) {        
          socket.emit('loggedIn', user);        
      });      
  }); 
});