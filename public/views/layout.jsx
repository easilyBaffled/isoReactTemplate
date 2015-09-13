'use strict';
var React = require('react');

module.exports = React.createClass({
    render: function render() {
        return (
          <html>
            <head>
              <meta charSet='utf-8' />
              <title>
                {this.props.title}
              </title>
            </head>
            <body>
              {this.props.children}                            
              <script src="../hello.min.js"></script>
            <script src="/socket.io/socket.io.js"></script>
            <script src='/bundle.js'></script>
            </body>            
          </html>
        );
    }
});