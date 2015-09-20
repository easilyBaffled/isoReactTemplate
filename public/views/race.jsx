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
        console.log("==============")
        clearInterval(interval);
        app.startRaceTracking();
        app.setState({countdownTime: ''});
      }
    }, 500);
  },
  startRaceTracking: function () {
    if(this.props.user.id === this.props.race.challenger) {
      RaceActions.startRaceTracking(this.props.socket, this.props.race);
    }
  },
  render: function() {
    var htmlToRender = '';
    var runner = {
        width: '15vh',
        height: '15vh',
    };
    var lable = {
      fontSize: '20px',
      display: 'inline-block'
    };
    var amount = {
      width: '12vh',
      height: '12vh',
      border: Style.borderGen('1px', 'green'),
      display: 'inline-block'
    };
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
        <div style={runner}>
          <div style={lable}>Runner 1 </div>
          <div style={amount}>{this.props.distance.toFixed(2)}</div>
        </div>
      </div>)
    }
    return htmlToRender;
  }
});
