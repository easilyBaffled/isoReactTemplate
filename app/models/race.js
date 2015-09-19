var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

var RaceSchema = new Schema({
    challenger: { type: String, default: '' },
    challenged: { type: String, default: '' },
    distance: { type: String, default: 0 },
    startTime: { type: Number, default: '' },
    currentTime: { type: String, default: '' },
    readyCount: {type: Number, default: 0 }
});

var Race = mongoose.model('Race', RaceSchema, 'Race');

module.exports = {
    createRace: function (challenger, challenged, distance, callback) {
      var race = new Race();
      race.challenger = challenger;
      race.challenged = challenged;
      race.distance = distance;
      race.save(function (err) {
          if (err)
              res.send(err);
          callback(race);
      });
    },
    readyUp: function (_id, callback) {
      Race.findOne({
          _id: _id,
      },  function (err, race) {
              if(err)
                  console.log("ERROR finding user");
              if(race) {
                race.readyCount += 1;
                race.save(function (err) {
                    if (err)
                        res.send(err);
                    callback(race);
                });
              }
          }
      );
    },
    setRaceTime: function (_id, startTime, callback) {
      Race.findOne({
          _id: _id,
      },  function (err, race) {
              if(err)
                  console.log("ERROR finding user");
              if(race) {
                race.startTime = startTime;
                race.save(function (err) {
                    if (err)
                        res.send(err);
                    callback(race);
                });
              }
          }
      )
    },
    getRace: function (_id, callback) {
        Race.findOne({
            _id: _id,
        },  function (err, race) {
                if(err)
                    console.log("ERROR finding user");
                if(race) {
                    callback(race);
                }
            }
        )
    }
}
