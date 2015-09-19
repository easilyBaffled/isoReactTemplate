var Flux = require('../utils/mcfly.js');
var RaceActions = Flux.createActions({
    reciveChallenge: function (raceData) {
        return {
            actionType: "CHALLENGE_RECIVE",
            raceData: raceData
        }
    },
    raceCreated: function (raceData) {
        return {
            actionType: "RACE_CREATED",
            raceData: raceData
        }
    },
    acceptChallenge: function (socket, race) {
        socket.emit("challengeAccepted", race);
        return {
            actionType: "CHALLENGE_ACCEPTED",
            race: race
        }
    },
    declineChallenge: function (socket, race) {
        socket.emit("challengeDeclined", race.challenger);
        return {
            actionType: "CHALLENGE_DECLINED",
            challengerID: challengerID
        }
    },
    startRaceTracking: function (socket, race) {
        socket.emit("startRaceTracking", race);
        return {
            actionType: "TRACKING_RACE"            
        }
    }
});
module.exports = RaceActions;
