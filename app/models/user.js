var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

var UserSchema = new Schema({
    id: String,
    socketID: String
});

var User = mongoose.model('User', UserSchema, 'User');

function getUser(userID, callback) {
    User.findOne({
        id: userID,
    },  function (err, user) {
            if(err)
                console.log("ERROR finding user");
            if(user) {
                callback(user);
            }
        }
    )
}

function logInUser(userID, socketID, callback) {
    User.findOne({
        id: userID,
    },  function (err, user) {
            if(err)
                console.log("ERROR finding user");
            if(user) {
              user.socketID = socketID;
              callback(user);
              user.save(function (err) {
                  if (err)
                      res.send(err);
              });
            } else {
                createUser(userID, socketID, callback);
            }
        }
    )
}

function createUser(userID, socketID, callback) {
    var user = new User();
    user.id = userID;
    user.socketID = socketID;
    user.save(function (err) {
        if (err)
            res.send(err);
        callback(user);
    });
}

module.exports = {
    'createUser': createUser,
    'getUser': getUser,
    'logInUser': logInUser
}
