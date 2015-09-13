var Flux = require('../utils/mcfly.js');
_screenerLists = {};

function updateScreenerData(jsonData) {    
    _screenerLists = jsonData; 
}

var ScreenerStore = Flux.createStore({    
    getScreenerLists: function () {
        return _screenerLists;
    }
}, function (payload) {
    if (payload.actionType === "UPDATE_SCREENER_LISTS") {
        updateScreenerData(payload.jsonData)
        //ScreenerStore.emitChange();
    }
    if (payload.actionType === 'API_PENDING' && payload.type === 'screener-data') {
        console.log(payload.type);
    }
});
module.exports = ScreenerStore;