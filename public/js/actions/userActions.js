var Flux = require('../utils/mcfly.js');
var UserActions = Flux.createActions({
    logInUser: function (socket, userData) {
        socket.emit('logIn', {id: userData.id});
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
    },
    challengeUser: function (socket, userID, challengedID) {
      socket.emit('submitChallenge', {id: userID, challengerID: challengedID});
      return {
          actionType: "CHALLENGING_USER",
          'userID': userID
      }
    }
});
module.exports = UserActions;
