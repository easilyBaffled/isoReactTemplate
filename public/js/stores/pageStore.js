var Flux = require('../utils/mcfly.js');
_currentPage = 'discover';

function updateCurrentPage(newPage) {    
    _currentPage = newPage;
}

var PageStore = Flux.createStore({    
    getCurrentPage: function () {
        return _currentPage;
    }
}, function (payload) {
    if (payload.actionType === "NAV_PAGE") {
        console.log('changing page to', payload.pageData)
        updateCurrentPage(payload.pageData);
        PageStore.emitChange();
    }    
});
module.exports = PageStore;