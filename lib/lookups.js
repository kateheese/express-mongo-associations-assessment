var db = require('monk')('localhost/breweries');
var breweries = db.get('breweries');
var beers = db.get('beers');
var taps = db.get('taps');

var lookups = {
  getBreweries: function() {
    return breweries.find({}, {sort: {name: 1}});
  },
  getBrewery: function(id) {
    return breweries.findById(id);
  },
  addBrewery: function(name, location) {
    return breweries.insert({ name: name, location: location });
  },
  breweryName: function(name) {
    return breweries.find({ name: name });
  },
  getBeers: function(beerIds) {
    return beers.find({ _id: { $in: beerIds }});
  },
  addBeer: function(breweryId, name, style, description, alcohol) {
    return breweries.findById(breweryId).then(function(brewery) {
      beers.insert({ name: name, style: style, description: description, alcohol: alcohol, breweryId: brewery._id }).then(function(beer) {
        breweries.update({ _id: breweryId },{ $push: { beerIds: beer._id } });
      });
    })
  },
  getBeer: function(id) {
    return beers.findById(id);
  },
  addTap: function(beerId, name) {
    return beers.findById(beerId).then(function(beer) {
      taps.insert({ name: name, beerIds: [beer._id] }).then(function(tap) {
        beers.update({ _id: beerId },{ $push: { tapIds: tap._id } });
      });
    })
  },
  getTaps: function(tapIds) {
    return taps.find({ _id: { $in: tapIds }});
  },
  getAllTaps: function() {
    return taps.find({}, {sort: {name: 1}});
  },
  getTap: function(id) {
    return taps.findById(id);
  }
};

module.exports = lookups;