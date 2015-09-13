var Flux = require('../utils/mcfly.js');
var Dispatcher = Flux.dispatcher;
var ScreenerStore = require('./screenerStore.js');
_stockData = {
            _searchedStockTicker: 'GOOG', 
            GOOG: {
                name: {
                    text: 'Google Inc.'
                },
                ticker: {
                    text: "GOOG",
                    href: "http://finviz.com/quote.ashx?t=Goog"
                },
                price: "547.32",
                priceChange: "-1.47%",
                '52wHigh': "-9.51%",
                relVol: "0.82",
                SMA20: "-1.15%" 
            }
        };

function updateStockData(jsonData) {
    _stockData[jsonData.ticker.text] = jsonData;
    _stockData._searchedStockTicker = jsonData.ticker.text;
}
function addStock(jsonData) {
    _stockData[jsonData.ticker.text] = jsonData;
}
var StockStore = Flux.createStore({
    getSingleStockPrice: function (ticker) {
        return _stockData[ticker];
    },
    getAllStocks: function () {
        return _stockData;
    },
    getSearchedData: function () {
        return this.getSingleStockPrice(_stockData._searchedStockTicker);
    }
}, function (payload) {
    if (payload.actionType === "UPDATE_STOCK_DATA") {
        updateStockData(payload.jsonData)
        StockStore.emitChange();
    }
    if (payload.actionType === "UPDATE_SCREENER_LISTS") {
        //updateScreenerData(payload.jsonData)
        Dispatcher.waitFor([ScreenerStore.dispatcherID]);
        _.forIn(payload.jsonData.lists[0], function (value) {
            _.forIn(value, function (stock) {
                addStock(stock)
            })
        });        
        StockStore.emitChange();
    }
    if (payload.actionType === 'API_PENDING'  && payload.type === 'stock-price') {
        console.log(payload.type);
    }
});
module.exports = StockStore;