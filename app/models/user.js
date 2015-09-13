var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

var UserSchema = new Schema({
    id: String,
    name: String,    
});

var User = mongoose.model('User', UserSchema, 'User');

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


function createUser(userID, name, callback) {    
    var user = new User();
    user.id = userID;
    user.name = name;       
    user.save(function (err) {
        if (err)
            res.send(err);        
        callback(user);
    });
}

module.exports = {
    'createUser': createUser,
    'getUser': getUser
}