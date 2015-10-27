var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/breweries')
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
  addBrewery: function(name, address, city) {
    return breweries.insert({ name: name, address: address, city: city, beerIds: [] });
  },
  breweryName: function(name) {
    return breweries.find({ name: name });
  },
  editBrewery: function(id, name, address, city) {
    return breweries.updateById(id, { $set: {name: name, address: address, city: city }});
  },
  deleteBrewery: function(id) {
    return breweries.findById(id).then(function(brewery) {
      if(brewery.beerIds.length > 0) {
        beers.find({ _id: { $in: brewery.beerIds }}).then(function(allBeers) {
          allBeers.forEach(function(beer) {
            taps.find({ _id: { $in: beer.tapIds }}).then(function(allTaps) {
              allTaps.forEach(function(tap) {
                taps.updateById(tap._id, { $pull: { beerIds: { $in: [beer._id]}}});
              })
            })
          })
        }).then(function() {
          beers.remove({ _id: { $in: brewery.beerIds }});
        })
      }
      breweries.remove({ _id: brewery._id });
    })
  },
  getBeers: function(beerIds) {
    return beers.find({ _id: { $in: beerIds }}, {sort: {name: 1}});
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
      breweries.update({_id: beer.breweryId}, { $pull: { beerIds: { $in: [beer._id]}}}).then(function() {
        beers.findById(id).then(function(beer) {
          taps.find({ _id: { $in: beer.tapIds }}).then(function(allTaps) {
            allTaps.forEach(function(tap) {
              taps.updateById(tap._id, { $pull: { beerIds: { $in: [beer._id]}}});
            })
          }).then(function() {
            beers.findById(id).then(function(beer) {
              beers.remove({ _id: beer._id });
            })
          })
        })
      })
    })
  },
  newTap: function(name, address, city) {
    return taps.insert({ name: name, address: address, city: city });
  },
  addTap: function(beerId, tapId) {
    return taps.findById(tapId).then(function(tap) {
      beers.update({ _id: beerId },{ $push: { tapIds: tap._id } }).then(function() {
        beers.findById(beerId).then(function(beer) {
          taps.update({ _id: tapId},{$push: { beerIds: beer._id }})
        })
      });
    });
  },
  getTaps: function(tapIds) {
    return taps.find({ _id: { $in: tapIds }}, {sort: {name: 1}});
  },
  getAllTaps: function() {
    return taps.find({}, {sort: {name: 1}});
  },
  getTap: function(id) {
    return taps.findById(id);
  },
  editTap: function(id, name, address, city) {
    return taps.updateById(id, { $set: {name: name, address: address, city: city }});
  },
  deleteTap: function(id) {
    return taps.findById(id).then(function(tap) {
      beers.find({ _id: { $in: tap.beerIds }}).then(function(allBeers) {
        allBeers.forEach(function(beer) {
          beers.updateById(beer._id, { $pull: { tapIds: { $in: [tap._id]}}});
        })
      }).then(function() {
        taps.findById(id).then(function(tap) {
          taps.remove({ _id: tap._id });
        })
      })
    })
  },
  removeBeerTap: function(beerId, tapId) {
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