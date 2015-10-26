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
    return breweries.insert({ name: name, location: location + ', CO', beerIds: [] });
  },
  breweryName: function(name) {
    return breweries.find({ name: name });
  },
  editBrewery: function(breweryId, name, location) {
    return breweries.updateById(breweryId, { $set: {name: name, location: location + ', CO' }});
  },
  deleteBrewery: function(id) {
    return breweries.findById(id).then(function(brewery) {
      if(brewery.beerIds.length > 0) {
        beers.remove({ _id: { $in: brewery.beerIds }});
      }
      breweries.remove({ _id: brewery._id });
    })
  },
  getBeers: function(beerIds) {
    return beers.find({ _id: { $in: beerIds }});
  },
  addBeer: function(breweryId, name, style, description, alcohol) {
    return breweries.findById(breweryId).then(function(brewery) {
      if(style === '') {
        style = 'style not provided';
      }
      if(description === '') {
        description = 'description not provided';
      }
      if(alcohol === '') {
        alcohol = '--';
      }
      beers.insert({ name: name, style: style, description: description, alcohol: alcohol, breweryId: brewery._id, tapIds: [] }).then(function(beer) {
        breweries.update({ _id: breweryId },{ $push: { beerIds: beer._id } });
      });
    })
  },
  beerName: function(name) {
    return beers.find({ name: name });
  },
  getBeer: function(id) {
    return beers.findById(id);
  },
  editBeer: function(id, name, style, description, alcohol) {
    return beers.updateById(id, { $set: { name: name, style: style, description: description, alcohol: alcohol }});
  },
  deleteBeer: function(id) {
    return beers.findById(id).then(function(beer) {
      breweries.update({_id: beer.breweryId}, { $pull: { beerIds: beer._id}}).then(function() {
        beers.remove({ _id: id });
      })
    })
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
  },
  deleteBeerTap: function(beerId, tapId) {
    return beers.findById(beerId).then(function(beer) {
      taps.findById(tapId).then(function(tap) {
        beers.update({ _id: beer._id },{ $pull: { tapIds: tap._id } }).then(function() {
          taps.update({ _id: tap._id },{ $pull: { beerIds: beer._id } })
        });
      })
    })
  }
};

module.exports = lookups;