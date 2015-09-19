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
       User: UserStore.getUserData(),
       tempID: '',
       challengedID: ''
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
        socket = io();
        socket.on('loggedIn', function (data) {
            UserActions.loggedInUser(data);
        });
        socket.on('Challenged', function (data) {
            console.log(data + "challenged you.")
        });
    },
    logInUser: function () {
      UserActions.logInUser(socket, {id: this.state.tempID});
    },
    updateInputValue: function(inputEvent) {
      this.setState({tempID: inputEvent.target.value});
    },
    challengeUser: function () {
      UserActions.challengeUser(socket, this.state.challengedID, this.state.User.id);
    },
    updateChallengerValue: function(inputEvent) {
      this.setState({challengedID: inputEvent.target.value});
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
            htmlToRender =
              (<div>
                  Hello {this.state.User.id}
                  <input onChange={this.updateChallengerValue} ref="challengerID"></input>
                  <button onClick={this.challengeUser} onTouchStart={this.challengeUser}> Challenge User </button>
                </div>)
        } else {
            htmlToRender =
            (<div>
              <input onChange={this.updateInputValue} ref="userIdBox"></input>
              <button style={logInButton} onClick={this.logInUser} onTouchStart={this.logInUser}> Log In </button>
            </div>)
        }
        return htmlToRender;
    }
});
