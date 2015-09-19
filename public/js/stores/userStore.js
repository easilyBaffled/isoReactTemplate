var Flux = require('../utils/mcfly.js');
var Dispatcher = Flux.dispatcher;
_user = '';
function setLoggedInUser (userData) {
    _user = userData;
}
var UserStore = Flux.createStore({
    getUserData: function (detail) {
        if(!detail) {
            return _user;
        } else {
            return _user[detail];
        }
    }
}, function (payload) {
    if (payload.actionType === "USER_LOGGED_IN") {
        setLoggedInUser(payload.userData)
        UserStore.emitChange();
    }
    if (payload.actionType === "LOGGING_IN") {
        console.log("Logging In User");
    }
    if (payload.actionType === "CHALLENGING_USER") {
        console.log("Sending challenge to " + payload.userID);
    }
});
module.exports = UserStore;
