var Flux = require('../utils/mcfly.js');
var UserActions = Flux.createActions({
    logInUser: function (socket, userData) {    
        socket.emit('logIn', {id: userData.id, name: userData.first_name});
        return {
            actionType: "LOGGING_IN",            
        }
    },
    loggedInUser: function (userData) {
        console.log("action to register user")
        return {
            actionType: "USER_LOGGED_IN",
            'userData': userData
        }
    }   
});
module.exports = UserActions;