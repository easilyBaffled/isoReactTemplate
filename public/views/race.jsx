'use strict';

var React = require('react');
var _ = require('lodash');
var Style = require('../js/styleConstants.js');
var RaceActions = require('../js/actions/raceActions.js');
var RaceStore = require('../js/stores/raceStore.js');

function getState(){
  return {
    countdownTime: 8
    ,
    currentDistance: 0
  }
}
module.exports = React.createClass({
  getInitialState: function(){
    return getState();
  },
  componentDidMount: function () {
    var fanFareAudio = new Audio('../marioKart.mp3');
    //fanFareAudio.play();
    this.countdown(this.props.race.startTime);
  },
  countdown: function (endTime) {
    var app = this;
    var interval = setInterval(function() {
      var current = new Date().getTime();
      var diff = (endTime - new Date().getTime())/1000
      if(diff > 0) {
          app.setState({countdownTime: Math.round(diff)});
      } else {
        clearInterval(interval);
        app.startRaceTracking();
        app.setState({countdownTime: ''});
      }
    }, 500);
  },
  startRaceTracking: function () {
    if(this.props.user.id === this.props.race.challenger) {
      RaceActions.startRaceTracking(this.props.socket, this.props.Race);
    }
  },
  render: function() {
    var htmlToRender = ''
    if(this.state.countdownTime) {
      htmlToRender =
      (<div>
        GET READY
        <div>{this.state.countdownTime}</div>
      </div>)
    } else {
      htmlToRender =
      (<div>
        START!!!
      </div>)
    }
    return htmlToRender;
  }
});
