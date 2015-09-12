var mongoose = require('mongoose');
var request = require('request');
var nodemailer = require('nodemailer');
var Schema = mongoose.Schema;
var _ = require('lodash');
var StockDataSchema = new Schema({
    ticker: String,    
    data: mongoose.Schema.Types.Mixed
});
var StockPriceSchema = new Schema({
    ticker: String,    
    price: String
});

var Data = mongoose.model('StockData', StockDataSchema, 'StockData');
var Price = mongoose.model('StockPrice', StockPriceSchema, 'StockPrice');

var apiTimer;
var dataPullAttempt = 0;
var lastRun;

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'lego90511@gmail.com',
        pass: 'ichtomhuggqahgwq'
    }
});
 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: '<lego90511@gmail.com>', // sender address 
    to: 'lego90511@gmail.com', // list of receivers 
    subject: 'Test', // Subject line 
    text: 'TEST', // plaintext body 
    html: '<b style="color: green">One Hell Of A Test ✔</b>' // html body 
};

function pullData () {
    if(dataPullAttempt > 30) {
        clearInterval(apiTimer);
        dataPullAttempt = 0; 
                mailOptions.text = "It Timed Out "; 
                mailOptions.html = '<div>It Timed Out</div>';
                // send mail with defined transport object 
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });  
    } else {
        dataPullAttempt += 1;    
    }
    
    request("https://www.kimonolabs.com/api/8wdwefs8?apikey=d753b0c5546495826e7aaa5422f59e30", 
        function(err, response, body) {            
            if(!err) {                
                if(JSON.parse(body).lastrunstatus === 'success') {
                    _.each(JSON.parse(body).results.collection1, function (stockData) {                        
                        updateData (stockData.ticker.text, stockData)                        
                    })
                    mailOptions.text = body; 
                    mailOptions.html = '<div>'+body+'</div>';
                    // send mail with defined transport object 
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            return console.log(error);
                        }
                        clearInterval(apiTimer);
                        dataPullAttempt = 0; 
                        console.log('Message sent: ' + info.response);
                    });
                } else {
                    console.log("Not Yet", lastRun, JSON.parse(body).lastrun);
                }
            } else {
                console.log("something failed", error);
            }                            
        }
   ); 
}

function pullPrice (tkrs, callBack) {        
    tkrs = Array.isArray(tkrs) ? tkrs.join() : tkrs
    request({
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer RlMh3mRAaAUUaTkMcr4JVRVMweHJ'
    },
    uri: 'https://sandbox.tradier.com/v1/markets/quotes?symbols='+tkrs,    
    method: 'GET'
  }, function (err, result, body) {
    callBack(JSON.parse(body).quotes.quote.last);
  });    
}

function prepPull (tkrs) {
    urls = _.map(tkrs, function (ticker) {
        return 'http://finviz.com/quote.ashx?t='+ticker+'&ty=l&ta=0&p=d'
    });    
    request.post({
        headers: {'content-type': 'application/json'},
        url: "https://www.kimonolabs.com/kimonoapis/8wdwefs8/update",
        form: {
                    apikey: "d753b0c5546495826e7aaa5422f59e30",
                    urls: urls
               }
        }, function (error, response, body) {              
            if(!error){
                request.post({
                    headers: {'content-type': 'application/json'},
                    url: "https://www.kimonolabs.com/kimonoapis/8wdwefs8/startcrawl",
                    form: {
                                apikey: "d753b0c5546495826e7aaa5422f59e30",
                           }
                    }, function (error, response, body) {                                                    
                        if(!error) {                         
                            console.log("Setting is done")
                            apiTimer = setInterval(function () {                            
                                pullData();
                            }, 300000)
                        } else {
                            mailOptions.text = "Scrape Failed to Start"; 
                            mailOptions.html = '<div>Scrape Failed to Start</div>';                    
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    return console.log(error);
                                }
                            });
                            console.log("something failed", error);
                        }                
                    }
                );
            } else {
                mailOptions.text = "Setting URLs Failed"; 
                mailOptions.html = '<div>Setting URLs Failed</div>';                    
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                });
            }
        }
    );
}

function updatePrice (tkr, price, res) {
    Price.findOneAndUpdate(        
        { ticker: tkr },
        { price: price},
        { upsert: true, }, 
        function (err, stock) {
            if (err) {
                res.json(err);
            } else {
                res.json(stock);                
            }
        }
    );
};

function getPrice (tkr, res) {
    Price.findOne({ticker: tkr}, 
        function(err, stock) { 
            if(err) {                
                res.json(err);
            } else {
                res.json(stock);                
            } 
        });
};

function getListData (tkrs, res) {    
    prices = {}
    _.each(tkrs, function(tkr) {
        Data.findOne({ticker: tkr}, 
        function(err, stock) { 
            prices[stock.ticker] = stock.data;
            if(Object.keys(prices).length === tkrs.length) {
                res(prices);
            }
        });
    })  
}

function getListPrices (tkrs, res) {        
    prices = {}
    _.each(tkrs, function(tkr) {    
        if(tkr !== ''){
            Price.findOne({ticker: tkr}, 
            function(err, stock) {                               
                prices[stock.ticker] = stock.price;            
                if(Object.keys(prices).length === tkrs.length) {
                    res(prices);
                }
            });
        }
    })  
}

function getAllPrice (res) {    
    Price.findOne({}, 
        function(err, stock) { 
            if(err) {                
                res.json(err);
            } else {
                res.json(stock);                
            } 
        });
};

function getData (tkr, res) {
    Data.findOne({ticker: tkr}, 
        function(err, stock) { 
        console.log(tkr)
            if(err) {                
                res.json(err);
            } else {
                res.json(stock);                
            } 
        });
};
function updateData (tkr, data) {
    Data.findOneAndUpdate(        
        { ticker: tkr },
        { data: data},
        { upsert: true, }, 
        function (err, stock) {
            if (err) {
                console.log(err);
            } else {
                console.log(stock);                
            }
        }
    );
};

function addStock (tkr, data, price, callBack) {
    console.log("adding", tkr)
    var ret = {data:'', price: ''}
    Price.findOneAndUpdate(        
        { ticker: tkr },
        { ticker: tkr, price: price},
        { upsert: true, }, 
        function (err, stock) {             
            if (err) {
                console.log("price failed")
                ret.price = err;
            } else {
                console.log("price stored");
                ret.price = 'success';
            }
            if(ret.data !== '') {
                callBack(ret);
            }
        }
    );
    Data.findOneAndUpdate(        
        { ticker: tkr },
        { ticker: tkr, data: data},
        { upsert: true, }, 
        function (err, stock) {
            if (err) {
                console.log("data failed")
                ret.data = err;
            } else {
                console.log("data stored");
                ret.data = 'success';
            }
            if(ret.price !== '') {
                callBack(ret);
            }
        }
    );
};
function removeStock (tkr, res) {    
    var ret = {data:'', price: ''}
    Price.findOneAndRemove(
        { ticker: tkr},        
        function (err, stock) {
            if (err) {
                ret.price = err;
            } else {
                ret.price = 'success';
            }
            if(ret.data !== '') {
                res.json(ret);
            }
        }
    );
    Data.findOneAndUpdate(
        { ticker: tkr},         
        function (err, stock) {
            if (err) {
                ret.data = err;
            } else {
                ret.data = 'success';
            }
            if(ret.price !== '') {
                res.json(ret);
            }
        }
    );
};

function getAllTickers(res) {
    Price.find({}, function(err, stocks) {
        if (!err){ 
            res(_.pluck(stocks, 'ticker'));            
        } else {throw err;}
    });
}

function storeStock(tickerSymbol, stockData) {
    Stock.findOneAndUpdate(
        { ticker: tickerSymbol},
        { data: stockData },
        { upsert: true, }, 
        function (err, stock) {
            if (err) {
                console.log("something went wrong", err);
            }
        }
    );
}
function generateRequestURL(tickerSymbol) {
    var ticker = "&t=" + tickerSymbol;
    var requestURL = "https://www.kimonolabs.com/api/ondemand/8wdwefs8?apikey=d753b0c5546495826e7aaa5422f59e30" + ticker;
    return requestURL
}
function pullSingStockData(tickerSymbol, callBack) {
    request(generateRequestURL(tickerSymbol),
        function (err, response, body) {
            var data = JSON.parse(body).results
            callBack(data);
        });
}
function getMultipleStockFromRequest(tickerList, resultsCallback) {
    var completedRequests = 0;
    var stocks = {}
    var delayTime = 0;
    var intervalID;
    console.log(tickerList.length);
    console.log(tickerList);
    intervalID = setInterval(function () {
        var ticker = tickerList.shift();
        var reqURL = generateRequestURL(ticker);
        request(reqURL, function (err, response, body) {
            body = JSON.parse(body)
            if (body.error) {
                console.log(body);
                console.log("error:", ticker);
                tickerList.push(ticker);
            } else {
                console.log("saved:", ticker, tickerList.length);
                stocks[ticker] = body.results;
                if (tickerList.length === 0) {
                    clearInterval(intervalID);
                    resultsCallback(stocks);
                }
                completedRequests++;
            }
        });
    }, 5000);
}

module.exports = {
'pullPrice': pullPrice,
'pullData': pullData,
'pullSingStockData': pullSingStockData,
'updatePrice': updatePrice,
'getPrice': getPrice,
'updateData': updateData,
'getData': getData,
'addStock': addStock,
'removeStock': removeStock,
'getAllPrice': getAllPrice,
'prepPull':prepPull,
'getAllTickers': getAllTickers,
'getListPrices': getListPrices,
'getListData': getListData
}