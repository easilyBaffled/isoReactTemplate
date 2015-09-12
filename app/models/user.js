var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var Stock = require('./stock');

var UserSchema = new Schema({
    id: String,
    name: String,
    actions: [{
        time: Date,
        action: String,
        amount: Number,
        stock: String
    }],
    stocks: { type : Schema.Types.Mixed, default : { }},
    score: Number
});

var User = mongoose.model('User', UserSchema, 'User');

function getLeaderboard(res) {
    User.find({}, function(err, users) {
        if (!err){ 
            res.json(_.map(users, function (user) {
                return {id: user.id, score: user.score}
            }));            
        } else {throw err;}
    });
}

function getUser(userID, name, callback) {
    User.findOne({
        id: userID
    },  function (err, user) {
            if(err) 
                console.log("ERROR finding user");
            if(user) {    
                callback(user);
            } else {
                createUser(userID, name, callback);
            }
        }
    )
}

function getUserScore (userId, res) {
    getUser(userId, '', function (user) {
        res(user.score)                    
    });    
}

function setUserScore (user) {            
    var tickers = Object.keys(user.stocks);  
    Stock.getListPrices(tickers, function (stocks) {
       user.score = 0;           
        _.each(stocks, function (price, tkr) {                
            user.score += price * user.stocks[tkr];                
        });           
        console.log("score", user.score)
        user.save(function (err) {
            if(err) {
                console.error('ERROR setting score!');
            }
        }); 
    });    
}


function createUser(userID, name, callback) {    
    var user = new User();
    user.id = userID;
    user.name = name;   
    user.actions = [];
    user.score = 0;
    user.markModified('stocks')
    user.save(function (err) {
        if (err)
            res.send(err);        
        callback(user);
    });
}

function removeUser(userID, res) {
    User.remove({
        id: userID
    }, function (err, user) {
        if (err)
            res.send(err);
        res.json({
            message: 'Successfully deleted'
        });
    });
}

function getUsersStocks(userID, res) {
    User.findOne({
        id: userID
    }, function (err, user) {
        if (err)
            res.send(err);
        res.json(user.stocks);
    });
}

function getListOfActions(userID, res) {
    User.findOne({
        id: userID
    }, function (err, user) {
        if (err)
            res.send(err);
        res.json(user.actions);
    });
}

function performAction(userID, tkr, newAmount, data, res) {
    User.findOne({ //Find User
        id: userID
    }, function (err, user) {
        if (err) res.send(err);
        console.log(user.stocks)
        user.stocks[tkr] = newAmount; 
        user.markModified('stocks')
        var action = {
            time: Date(),
            amount: newAmount,
            stock: tkr
        };
        user.actions.push(action);
        if(data) {
            Stock.addStock(tkr, data, data.price, function (result) {console.log(JSON.stringify(result))});
        }
        user.save(function (err) {
            if (err) console.log("ERROR saving user actions");
            res.json({
                actions: user.actions,
                stocks: user.stocks
            });
            
            setUserScore(user);
        });        
    });
}

module.exports = {
    'createUser': createUser,
    'getUserScore': getUserScore,
    'setUserScore': setUserScore,
    'getUser': getUser,
    'removeUser': removeUser,
    'getUsersStocks': getUsersStocks,
    'getListOfActions': getListOfActions,
    'performAction': performAction,
    'getLeaderboard': getLeaderboard
}