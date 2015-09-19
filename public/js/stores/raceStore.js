var Flux = require('../utils/mcfly.js');
var Dispatcher = Flux.dispatcher;
_race = '';
_challenged = false;
function setRace (race) {
    _race = race;
}
function setChallengedState (state) {
    _challenged = state;
}
var RaceStore = Flux.createStore({
    getRace: function () {
        return _race;
    },
    getChallengedState: function () {
        return _challenged;
    }
}, function (payload) {
    if (payload.actionType === "RACE_CREATED") {
        setRace(payload.raceData)
        RaceStore.emitChange();
    }
    if (payload.actionType === "CHALLENGE_RECIVE") {
        setRace(payload.raceData);
        setChallengedState(true);
        RaceStore.emitChange();
    }
    if (payload.actionType === "CHALLENGE_DECLINED") {
        setRace('')
        setChallengedState(false);
        RaceStore.emitChange();
    }
    if (payload.actionType === "CHALLENGE_ACCEPTED") {
        setChallengedState(false);
        RaceStore.emitChange();
    }
});
module.exports = RaceStore;
