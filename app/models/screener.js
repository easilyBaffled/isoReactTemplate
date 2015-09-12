var mongoose = require('mongoose');
var request = require("request");
var _ = require('lodash');
var Schema = mongoose.Schema;

var ScreenedListSchema = new Schema({
    time: String,
    lists: []
});

var ScreenedList = mongoose.model('ScreenedList', ScreenedListSchema);

function getScreenedLists(res) {
    console.log("Attempting to get Updated Screened Lists");
    request("https://www.kimonolabs.com/api/4fzlhe90?apikey=d753b0c5546495826e7aaa5422f59e30",
        function (err, response, body) {
            console.log("Request has returned")
            if(res){
                res.json({
                    data: JSON.parse(body).results.collection1,
                    error: err 
                });
            }
            var screenedLists = {};
            var stocks = JSON.parse(body).results.collection1;
            var criteriaList = ["priceChange", "vol", "ROI", "reltiveStrength", "perfWeek", "SMA50"];
            _.forEach(criteriaList, function (criteria) {
                var screenedList = sortScreenedData(stocks, criteria);
                screenedLists[criteria] = screenedList;
            });
            console.log(JSON.parse(body).thisversionrun);
            ScreenedList.findOneAndUpdate({}, {
                lists: screenedLists,
                time: JSON.parse(body).thisversionrun
            }, {
                upsert: true
            }, function () {
                console.log("completing run")
            });
        });
};

function sortScreenedData(data, attribute) {
    return (_.sortBy(data, attribute)).slice(0, 3);
};

function getAllScreenedListsFromDB(res) {
    ScreenedList.findOne({
        _id: "54e0b5828ebc0173d2000003"
    }, function (err, screenedList) {
        if (err)
            res.send(err);
        console.log("Found something");
        res.json({
            lists: screenedList.lists,
            time: screenedList.time
        });
    });
}

module.exports = {
    'getScreenedLists': getScreenedLists,
    'getScreenedListsFromDB': getAllScreenedListsFromDB
}