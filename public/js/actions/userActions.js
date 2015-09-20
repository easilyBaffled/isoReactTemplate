var Flux = require('../utils/mcfly.js');
var UserActions = Flux.createActions({
    logInUser: function (socket, userData) {
        socket.emit('logIn', {id: userData.id});
        return {
            actionType: "LOGGING_IN",
        }
    },
    loggedInUser: function (userData) {
        return {
            actionType: "USER_LOGGED_IN",
            'userData': userData
        }
    },
    challengeGhost: function (socket, userID, challengedID, raceDistance) {
      socket.emit('challengeGhost', {challenger: userID, challenged: challengedID, raceDistance: raceDistance});
      return {
          actionType: "CHALLENGING_GHOST",
          'userID': userID
      }
    },
    challengeUser: function (socket, userID, challengedID, raceDistance) {
      socket.emit('submitChallenge', {challenger: userID, challenged: challengedID, raceDistance: raceDistance});
      return {
          actionType: "CHALLENGING_USER",
          'userID': userID
      }
    },
    readyUp: function (socket, race) {
      console.log(race)
      socket.emit("ready", race._id);
      return {
          actionType: "ANNOUCED_READY",
      }
    }
});
module.exports = UserActions;
