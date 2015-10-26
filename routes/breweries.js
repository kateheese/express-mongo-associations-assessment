var express = require('express');
var router = express.Router();
var lookups = require('../lib/lookups.js');
var locations = require('../lib/location.js');

router.get('/', function(req, res, next) {
  lookups.getBreweries().then(function(breweries) {
    res.render('breweries', { title: 'Colorado Breweries', breweries: breweries, locations: locations });
  });
});

router.post('/', function(req, res, next) {
  lookups.breweryName(req.body.name).then(function(brewery) {
    var errors = [];
    if(!req.body.name.trim()) {
      errors.push("Name can't be blank");
    }
    if(req.body.location == undefined) {
      errors.push("Please select a city");
    }
    if(brewery.length) {
      errors.push("Brewery has already been added");
    }
    if(errors.length) {
      lookups.getBreweries().then(function(breweries) {
        res.render('breweries', { 
          title: 'Colorado Breweries',
          name: req.body.name, 
          location: req.body.location, 
          errors: errors, 
          breweries: breweries,
          locations: locations })
      });
    } else {
      lookups.addBrewery(req.body.name, req.body.location).then(function() {
        res.redirect('/breweries');
      })
    }
  })
});

router.get('/:id', function(req, res, next) {
  lookups.getBrewery(req.params.id).then(function(brewery) {
    if(brewery.beerIds.length > 0) {
      lookups.getBeers(brewery.beerIds).then(function(beers) {
        res.render('brewery', { title: brewery.name, brewery: brewery, beers: beers });
      });
    } else {
      res.render('brewery', { title: brewery.name, brewery: brewery });
    }
  })
})

router.get('/:id/edit', function(req, res, next) {
  lookups.getBrewery(req.params.id).then(function(brewery) {
    res.render('brewery-edit', { title: 'Edit ' + brewery.name, brewery: brewery, locations: locations });
  });
});

router.post('/:id/update', function(req, res, next) {
  lookups.editBrewery(req.params.id, req.body.name, req.body.location).then(function() {
    res.redirect('/breweries');
  });
});

router.post('/:id/delete', function(req, res, next) {
  lookups.deleteBrewery(req.params.id).then(function() {
    res.redirect('/breweries');
  });
});

router.post('/:id/beers', function(req, res, next) {
  lookups.beerName(req.body.name).then(function(beer) {
    var errors = [];
    if(!req.body.name.trim()) {
      errors.push("Name can't be blank");
    }
    if(errors.length) {
      lookups.getBrewery(req.params.id).then(function(brewery) {
        if(brewery.beerIds.length > 0) {
          lookups.getBeers(brewery.beerIds).then(function(beers) {
            res.render('brewery', { title: brewery.name, 
              brewery: brewery, 
              beers: beers, 
              errors: errors,
              name: req.body.name,
              style: req.body.style,
              description: req.body.description,
              alcohol: req.body.alcohol });
          });
        } else {
          res.render('brewery', { title: brewery.name, 
            brewery: brewery, 
            errors: errors,
            name: req.body.name,
            style: req.body.style,
            description: req.body.description,
            alcohol: req.body.alcohol });
        }
      })
    } else {
      lookups.addBeer(req.params.id, req.body.name, req.body.style, req.body.description, req.body.alcohol).then(function() {
        res.redirect('/breweries/' + req.params.id);
      });
    }
  })
});

router.get('/:breweryId/beers/:id', function(req, res, next) {
  lookups.getBeer(req.params.id).then(function(beer) {
    lookups.getAllTaps().then(function(allTaps) {
      if(beer.tapIds.length > 0) {
        lookups.getTaps(beer.tapIds).then(function(taps) {
          res.render('beer', { title: beer.name, beer: beer, taps: taps, allTaps: allTaps })
        })
      } else {
      res.render('beer', { title: beer.name, beer: beer, allTaps: allTaps })
      }
    })
  })
});

router.get('/:breweryId/beers/:id/edit', function(req, res, next) {
  lookups.getBeer(req.params.id).then(function(beer) {
    res.render('beer-edit', { title: 'Edit ' + beer.name, beer: beer });
  })
});

router.post('/:breweryId/beers/:id/update', function(req, res, next) {
  lookups.editBeer(req.params.id, req.body.name, req.body.style, req.body.description, req.body.alcohol).then(function() {
    res.redirect('/breweries/' + req.params.breweryId + '/beers/' + req.params.id);
  });
});

router.post('/:breweryId/beers/:id/delete', function(req, res, next) {
  lookups.deleteBeer(req.params.id).then(function() {
    res.redirect('/breweries/' + req.params.breweryId);
  });
});

router.get('/:breweryId/beers/:id/taps/new', function(req, res, next) {
  res.render('new-tap', { title: 'New Tap', beerId: req.params.id, breweryId: req.params.breweryId });
});

router.post('/:breweryId/beers/:id/taps/new', function(req, res, next) {
  lookups.newTap(req.body.name).then(function(tap) {
    lookups.addTap(req.params.id, tap._id).then(function() {
      res.redirect('/breweries/' + req.params.breweryId + '/beers/' + req.params.id);
    })
  })
});

router.post('/:breweryId/beers/:id/taps', function(req, res, next) {
  lookups.addTap(req.params.id, req.body.location).then(function() {
    res.redirect('/breweries/' + req.params.breweryId + '/beers/' + req.params.id);
  })
});

router.get('/:breweryId/beers/:beerId/taps/:id', function(req, res, next) {
  lookups.getTap(req.params.id).then(function(tap) {
    lookups.getBeers(tap.beerIds).then(function(beers) {
      res.render('tap', { title: tap.name, beers: beers, tap: tap });
    })
  })
});

router.post('/:breweryId/beers/:beerId/taps/:id/delete', function(req, res, next) {
  lookups.deleteBeerTap(req.params.beerId, req.params.id).then(function() {
    res.redirect('/breweries/' + req.params.breweryId + '/beers/' + req.params.beerId);
  })
})

module.exports = router;