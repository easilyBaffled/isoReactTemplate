'use strict';

// make `.jsx` file requirable by node
require('node-jsx').install();

var path = require('path'),
    express = require('express'),
    renderer = require('react-engine'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Stock = require('./app/models/stock'),
    Screener = require('./app/models/screener'),
    User = require('./app/models/user'),
    morgan  = require('morgan'),
    http = require('http'),
    socketIO = require('socket.io').listen(3000);
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
  res.render(req.url, {
    title: 'React Engine Express Sample App',
    name: 'Jordan'
  });
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
var io = socketIO.listen(server)
io.on('connection', function (socket) {
  socket.on('logIn', function (data) {
      User.getUser(data.id, data.name, function (user) {
        socket.emit('loggedIn', user);        
      });      
  });
});

//
//var engine = renderer.server.create({
//  routes: require(path.join(__dirname + '/public/routes.jsx')),
//  routesFilePath: path.join(__dirname + '/public/routes.jsx')
//});
//
//app.engine('.jsx', engine);
//
//app.set('views', __dirname + '/public/views');
//
//app.set('view engine', 'jsx');
//
//app.set('view', renderer.expressView);
//
//app.get('/', function(req, res) {
//  res.render('app', {
//    title: 'React Engine Express Sample App',
//  });
//});
//
//// 404 template
//app.use(function(req, res) {
//  res.render('404', {
//    title: 'React Engine Express Sample App',
//    url: req.url
//  });
//});
//app.use(express.static(__dirname + '/public'));
//function shrink () {
//var router = express.Router(); // get an instance of the express Router
//router.use(function (req, res, next) {
//    // do logging
//    console.log('Something is happening.');
//    next(); // make sure we go to the next routes and don't stop here
//});
//router.route('/screener/current')
//    .get(function (req, res) { //Returns 6 lists of screened stocks, each according to certain parameters
//        console.log("getting saved screened list")
//        Screener.getScreenedListsFromDB(res)
//    })
//router.route('/screener/update')
//    .get(function (req, res) { //Gets a list of screened stocks and creates 6 lists of the best stocks according to certain parameters
//        console.log("updating screened list")
//        Screener.getScreenedLists(res);
//    })
//router.route('/stock/:ticker')
//    .get(function (req, res) { //Pulls stock data directly from FinViz
//        Stock.getStockData(req.params.ticker, res, false);
//    })
//
//router.route('/stock/data/:ticker')
//    .get(function (req, res) { //Pulls stock data directly from FinViz
//        Stock.pullData([req.params.ticker], res);
//    //Stock.pullData(['K', 'F', 'POST', 'CVT', 'ZYNE', 'STMP'], res);
//    })
//router.route('/user/:user_id')
//    .post(function (req, res) { //Creates a new empty use
//        User.createUser(req.params.user_id, res.json);
//    })
//    .get(function (req, res) { //Gets user data including stocks and actions
//        User.getUser(req.params.user_id, res);
//    })
//    .delete(function (req, res) { //Removes user from DB
//        User.removeUser(req.params.user_id, res);
//    });
//router.route('/user/:user_id/stocks')
//    .get(function (req, res) { //Gets a list of user's stocks from DB
//        User.getUsersStocks(req.params.user_id, res);
//    });
//router.route('/user/:user_id/action')
//    .post(function (req, res) { //Performs an action of the form [action: (buy or sell), amount: number, stock: ticker]
//        User.performAction(req.params.user_id, req.body, res);
//    })
//    .get(function (req, res) { //Get's a list of the users actions //TODO: add specification between buy and sellHey,
//        User.getListOfActions(req.params.user_id, res);
//    })
//    // REGISTER OUR ROUTES -------------------------------
//    // all of our routes will be prefixed with /api
//
//router.route('/leaderboard')
//    .get(function (req, res) {
//        User.getLeaderboard(res);
//    });
//router.route('/login/:user_id/:user_name')
//    .get(function (req, res) {
//        User.getUser(req.params.user_id, req.params.user_name, res);
//    });
//
//app.use('/api', router);
//}
//var server = app.listen(3001, function() {       
//    console.log('Example app listening at 3001');
//});
//var io = require('socket.io').listen(server);
//io.on('connection', function (socket) {
//  socket.on('logIn', function (data) {
//      User.getUser(data.id, data.name, function (user) {
//        socket.emit('loggedIn', user);        
//      });      
//  });
//});
