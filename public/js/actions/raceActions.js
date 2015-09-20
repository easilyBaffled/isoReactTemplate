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
        var distanceObj = {};
        distanceObj[race.challenger] = 0;
        distanceObj[race.challenged] = 0;

        var lastItteration = {}
        lastItteration[race.challenger] = 0; //last position
        lastItteration[race.challenged] = 0;
        socket.emit('calculateDistance', {race: race, distance: distanceObj, lastIttr: lastItteration});
        return {
            actionType: "TRACKING_RACE"
        }
    }
});
module.exports = RaceActions;
