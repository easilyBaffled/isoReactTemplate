var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
    id: String,
    actions: [{
        time: Date,
        verb: String,
        amount: Number,
        stock: String
    }],
    stocks: [{
        symbol: String,
        amount: Number
    }]
});


module.exports = {
    user: mongoose.model('User', UserSchema),

}