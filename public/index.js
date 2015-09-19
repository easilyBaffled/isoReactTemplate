'use strict';

var Routes = require('./routes.jsx');
var Client = require('react-engine/lib/client');

// boot options
var options = {
  routes: Routes,

  // supply a function that can be called
  // to resolve the file that was rendered.
  viewResolver: function(viewName) {
    return require('./views/' + viewName);
  }
};

document.addEventListener('DOMContentLoaded', function onLoad() {
  Client.boot(options);
});
