/*-------------------------------------------------------------------------------------------------------------------*\
 |  Copyright (C) 2015 PayPal                                                                                          |
 |                                                                                                                     |
 |  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance     |
 |  with the License.                                                                                                  |
 |                                                                                                                     |
 |  You may obtain a copy of the License at                                                                            |
 |                                                                                                                     |
 |       http://www.apache.org/licenses/LICENSE-2.0                                                                    |
 |                                                                                                                     |
 |  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed   |
 |  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for  |
 |  the specific language governing permissions and limitations under the License.                                     |
 \*-------------------------------------------------------------------------------------------------------------------*/

'use strict';
var React = require('react');
var socket;

module.exports = React.createClass({
    componentDidMount: function () {       
        hello.init(
        {	
           google: '1010401458239-gqa1kobbbolki48fntj70ukjtsl0vct4.apps.googleusercontent.com'
        }, {        
            redirect_uri: 'http://localhost:3001/'
        }); 
        socket = io();  
        socket.on('loggedIn', function (data) {
            console.log(data);
        });        
    },
    clicked: function () {
        socket.emit('logIn', {name: "Dan"});    
        console.log("clicked");
    },
    signInUser: function () {
        console.log("signing In")
        hello('google').login().then(function(auth) {
           // Call user information, for the given network
           hello(auth.network).api('/me').then(function(r) {
               socket.emit('logIn', {id: r.id, name: r.first_name});           
               console.log(r);
           });
        });
    },
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
              <button onClick={this.clicked}>click me</button>
              <button onClick={this.signInUser}>Google Sign In</button>
              <script src="/socket.io/socket.io.js"></script>
              <script src="../hello.min.js"></script>
            <script src='/bundle.js'></script>
            </body>            
          </html>
        );
    }
});