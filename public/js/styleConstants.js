var reactPrefix = require('react-prefixr');
module.exports = {
    browserDisplay: '-webkit-flex',
    badColor: '#fc4349',
    goodColor: '#00ff1d',
    red: '#fc4349',
    green: '#00ff1d',
    black: '#000000', 
    blue: '#01bbff',        
    flexRow: {        
        display: this.browserDisplay,
        WebkitFlexDirection: 'row',
        flexDirection: 'row',
        WebkitJustifyContent: 'space-between',
        justifyContent: 'space-between',
        WebkitAlignItems: 'center',
        alignItems: 'center'
    },
    flexColumn: {        
        display: this.browserDisplay,
        WebkitFlexDirection: 'column',
        flexDirection: 'column',
        WebkitJustifyContent: 'flex-start',
        justifyContent: 'flex-start',
        WebkitAlignItems: 'center',
        alignItems: 'center'
    },
    flexCentering: {
        display: this.browserDisplay,
        WebkitAlignItems: 'center',
        alignItems: 'center',
        WebkitJustifyContent: 'center',
        justifyContent: 'center',
    },
    borderGen: function (size, color) {
        return (size || '1px') +' solid '+ (color || '#000000')
    },
    absolutePositioner: function (topPos, leftPos) {
        return {
            position: 'absolute',
            top: topPos,
            left: leftPos
        }
    },
    tempMerge: function (first, second) {        
        var result = first;              
        for (var key in second) {
            result[key] = second[key];
        }        
        return result
    },
    evaluateColor: function(numberString) {
        if(typeof numberString === 'number') {
            numberString = numberString.toString();
        }
        if(numberString.indexOf('-') > -1) {
            return this.badColor;
        } else {
            return this.goodColor;
        }
    },
    prefix: function(styleObject) {        
        return reactPrefix(styleObject);
    },
    fontSize: function(sizeSetting) {
        var sizeValue = ''
        if(sizeSetting === 1) {
            sizeValue = '3vmin';
        } else if(sizeSetting === 2) {
            sizeValue = '4vmin';
        } else if(sizeSetting === 3) {
            sizeValue = '6vmin';
        } else if(sizeSetting === 4) {
            sizeValue = '7vmin';
        } else if(sizeSetting === 5) {
            sizeValue = '8vmin';
        }
        
        return sizeValue;
    },
    setBrowserDisplay: function (browser) {        
        this.browserDisplay = (browser.indexOf('Safari') != -1 && browser.indexOf('Chrome') == -1)? '-webkit-flex': 'flex';
    }
};