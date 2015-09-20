'use strict';

var React = require('react');
React.initializeTouchEvents(true);
var _ = require('lodash');
var Style = require('../js/styleConstants.js');
var UserActions = require('../js/actions/userActions.js');
var RaceActions = require('../js/actions/raceActions.js');
var UserStore = require('../js/stores/userStore.js');
var RaceStore = require('../js/stores/raceStore.js');
var Notification = require('./notification.jsx');
var Race = require('./race.jsx');
var socket;

function getState(){
  return {
    User: UserStore.getUserData(),
    Race: RaceStore.getRace(),
    challenged: RaceStore.getChallengedState(),
    tempID: '',
    challengedID: '',
    raceDistance: 0,
    readyUp: false,
    racing: false,
  }
}
module.exports = React.createClass({
  mixins: [UserStore.mixin, RaceStore.mixin],
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
    socket.on('raceCreated', function (race) {
      RaceActions.raceCreated(race);
    });
    socket.on('Challenged', function (raceData) {
      RaceActions.reciveChallenge(raceData);
    });
    socket.on('challengeDeclined', function () {
      console.log("Your Challenge Has Been declined");
    });

    socket.on('raceCreatedAndReadyUp', function (race) {
      app.setState({readyUp: true});
      RaceActions.raceCreated(race);
    });
    socket.on('readyUp', function () {
      app.setState({readyUp: true});
    });
    socket.on('start', function (race) {
      app.setState({Race: race, racing: true});
    })
  },
  logInUser: function () {
    UserActions.logInUser(socket, {id: this.state.tempID});
  },
  updateInputValue: function(inputEvent) {
    this.setState({tempID: inputEvent.target.value});
  },
  challengeUser: function () {
    if(this.state.challengedID === "ghost") {
      UserActions.challengeGhost(socket, this.state.User.id, this.state.challengedID, this.state.raceDistance);
    } else {
        UserActions.challengeUser(socket, this.state.User.id, this.state.challengedID, this.state.raceDistance);
    }
  },
  updateChallengerValue: function(inputEvent) {
    this.setState({challengedID: inputEvent.target.value});
  },
  updateDistanceValue: function(inputEvent) {
    this.setState({raceDistance: inputEvent.target.value});
  },
  readyUp: function () {
    this.setState({readyUp: false});
    console.log(this.state.Race);
    UserActions.readyUp(socket, this.state.Race);
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

    if(this.state.User) {
      if(this.state.readyUp) {
        htmlToRender =
        (<div>
          <button onClick={this.readyUp} onTouchStart={this.readyUp}>Ready Up</button>
        </div>)
      } else if (this.state.racing) {
        htmlToRender =
        (<div>
          <Race race={this.state.Race} user={this.state.User} socket={socket}></Race>
        </div>)
      } else {
        htmlToRender =
        (<div>
          Hello {this.state.User.id}
          <Notification race={this.state.Race} challenged={this.state.challenged} socket={socket}></Notification>
          <input onChange={this.updateChallengerValue} ref="challengerID"></input>
          <input onChange={this.updateDistanceValue} ref="distanceInput"></input>
          <button onClick={this.challengeUser} onTouchStart={this.challengeUser}> Challenge User </button>
        </div>)
      }
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
