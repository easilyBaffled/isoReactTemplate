'use strict';

var React = require('react');
var _ = require('lodash');
var Style = require('../js/styleConstants.js');
var RaceActions = require('../js/actions/raceActions.js');

module.exports = React.createClass({
    declineChallenge: function () {
      RaceActions.declineChallenge(this.props.socket, this.props.race);
    },
    acceptChallenge: function () {
      RaceActions.acceptChallenge(this.props.socket, this.props.race);
    },
    render: function() {
        var htmlToRender = '';
        if(this.props.challenged) {
          htmlToRender = (<div>
                            {this.props.race.challenger} Wants To Race
                            <button onClick={this.acceptChallenge} onTouchStart={this.acceptChallenge}>Accept</button>
                            <button onClick={this.declineChallenge} onTouchStart={this.declineChallenge}>Decline</button>
                          </div>)
        } else {
          htmlToRender = <div></div>
        }
        return htmlToRender;
    }
});
