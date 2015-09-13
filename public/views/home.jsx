'use strict';

var React = require('react');
React.initializeTouchEvents(true);
var _ = require('lodash');
var Style = require('../js/styleConstants.js');
var UserActions = require('../js/actions/userActions.js');
var UserStore = require('../js/stores/userStore.js');
var socket;

function getState(){       
   return {
       User: UserStore.getUserData()
   }
}
module.exports = React.createClass({
    mixins: [UserStore.mixin],
    getInitialState: function(){
        return getState();
    },
    storeDidChange: function () {
        this.setState(getState());
    },
    componentDidMount: function () {
        var app = this;
        hello.init(
        {	
           google: 'GOOGLE CONFIGURE STRING: https://console.developers.google.com/project?authuser=0'
        }, {        
            redirect_uri: 'http://localhost:3001/'
        }); 
        socket = io();  
        socket.on('loggedIn', function (data) {
            UserActions.loggedInUser(data);            
        });       
    },    
    logInUser: function () {        
        hello('google').login().then(function(auth) {
           hello(auth.network).api('/me').then(function(userResponseData) {
               UserActions.logInUser(socket, userResponseData);               
           });
        });
    },

    render: function() {
        var htmlToRender;  
        var appContainer = {
            height: '100%',
            width: '100%'
        }
        _.assign(appContainer, Style.flexColumn);
        _.assign(appContainer, Style.flexCentering);
        _.assign(appContainer, {
            WebkitAlignItems: 'flex-start',
            alignItems: 'flex-start',
        });
        
        var logInButton = {
            width: '70%',
            height: '15%',
            margin: '15%',
            fontSize: '8vw'
        }                
        console.log(this.state.User);
        if(this.state.User) {
            htmlToRender = <div>Hello {this.state.User.name}</div>
        } else {
            htmlToRender = <button style={logInButton} onClick={this.logInUser} onTouchStart={this.signInUser}> Log In </button>
        }        
        return htmlToRender;
    }
});
