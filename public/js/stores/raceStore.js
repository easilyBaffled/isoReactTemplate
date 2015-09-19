var Flux = require('../utils/mcfly.js');
var Dispatcher = Flux.dispatcher;
_challenger = '';
function setChallenger (userID) {
    _challenger = userID;
}
var RaceStore = Flux.createStore({
    getChallengerID: function () {
        return _challenger;
    }
}, function (payload) {
    if (payload.actionType === "CHALLENGE_RECIVE") {
        setChallenger(payload.challengerID)
        RaceStore.emitChange();
    }
    if (payload.actionType === "CHALLENGE_DECLINED") {
        setChallenger('')
        RaceStore.emitChange();
    }
    if (payload.actionType === "CHALLENGE_ACCEPTED") {
        setChallenger('')
        RaceStore.emitChange();
    }
});
module.exports = RaceStore;
