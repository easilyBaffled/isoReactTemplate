#!/usr/bin/env node
var Stock = require('./app/models/stock');
Stock.getAllTickers(function (tickerList) {
    Stock.prepPull(tickerList );    
});