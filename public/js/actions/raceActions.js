var Flux = require('../utils/mcfly.js');
var RaceActions = Flux.createActions({
    reciveChallenge: function (challengerID) {
        return {
            actionType: "CHALLENGE_RECIVE",
            challengerID: challengerID
        }
    },
    acceptChallenge: function (socket, challengerID) {
        socket.emit("challengeAccepted", challengerID);
        return {
            actionType: "CHALLENGE_ACCEPTED",
            challengerID: challengerID
        }
    },
    declineChallenge: function (socket, challengerID) {
        socket.emit("challengeDeclined", challengerID);
        return {
            actionType: "CHALLENGE_DECLINED",
            challengerID: challengerID
        }
    }
});
module.exports = RaceActions;
