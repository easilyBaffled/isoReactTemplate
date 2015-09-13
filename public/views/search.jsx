var React = require('react');
var _ = require('lodash');
var Style = require('../js/styleConstants.js');

module.exports = React.createClass({       
    componentDidMount: function () {
        console.log(this.props);
        this.props.socket.emit('searchAvailible', {message: 'ready'});        
    },
    render: function() {
        var spinnerStyle = {
            fontSize: '6vw'
        }
        var searchContainer = {
            width: '100%',
            height: '20mvax'            
        }
        _.assign(searchContainer, Style.flexColumn);
        var searchInput = {
            width: '80%',
            border: '3px solid #000',
            padding: '2%',
            fontSize: Style.fontSize(3),
            position: 'relative'
        };
        var spinner = {
            position: 'absolute',            
            height: '4%',
            width: '8%',
            top: '10%',
            right: '10%'
        }
        return (
        <div style={Style.prefix(searchContainer)}>
            <input style={Style.prefix(searchInput)}>                
            </input>
        </div>
        )
    }
});