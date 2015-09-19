'use strict';

var React = require('react');
var _ = require('lodash');
var Style = require('../js/styleConstants.js');
var RaceActions = require('../js/actions/raceActions.js');

module.exports = React.createClass({
    declineChallenge: function () {
      RaceActions.declineChallenge(this.props.socket, this.props.challenger);
    },
    acceptChallenge: function () {
      RaceActions.acceptChallenge(this.props.socket, this.props.challenger);
    },
    render: function() {
        var htmlToRender = '';
        if(this.props.challenger) {
          htmlToRender = (<div>
                            {this.props.challenger} Wants To Race
                            <button onClick={this.acceptChallenge} onTouchStart={this.acceptChallenge}>Accept</button>
                            <button onClick={this.declineChallenge} onTouchStart={this.declineChallenge}>Decline</button>
                          </div>)
        } else {
          htmlToRender = <div></div>
        }
        return htmlToRender;
    }
});
