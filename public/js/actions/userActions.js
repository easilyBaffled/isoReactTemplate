var Flux = require('../utils/mcfly.js');
var UserActions = Flux.createActions({
    updateUserData: function (actionData) {        
        return {
            actionType: "UPDATE_USER_DATA",
            'actionData': actionData
        }
    },
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
    },
    getUserData: function (userId) {
        API.getUserData(userId, function (userData) {
            UserActions.signInUser(userData);
        });
        return {            
            actionType: "API_PENDING",
            type: 'get_user_data'
        }
    },
    signOutUser: function (actionData) {
        return {
            actionType: "USER_SIGN_OUT",
            'actionData': actionData 
        }
    }
});
module.exports = UserActions;