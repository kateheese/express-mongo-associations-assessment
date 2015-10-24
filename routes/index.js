var express = require('express');
var router = express.Router();
var lookups = require('../lib/lookups.js');
var db = require('monk')('localhost/breweries');
var breweries = db.get('breweries');
var beers = db.get('beers');
var onTap = db.get('tap');

router.get('/', function(req, res, next) {
  lookups.getBreweries().then(function(breweries) {
    res.render('index', { title: 'Colorado Breweries', breweries: breweries });
  });
});

router.post('/', function(req, res, next) {
  lookups.breweryName(req.body.name).then(function(brewery) {
    var errors = [];
    if(!req.body.name.trim()) {
      errors.push("Name can't be blank");
    }
    if(!req.body.location.trim()) {
      errors.push("Location can't be blank");
    }
    if(brewery.length) {
      errors.push("Brewery has already been added");
    }
    if(errors.length) {
      lookups.getBreweries().then(function(breweries) {
        res.render('index', { 
          title: 'Colorado Breweries',
          name: req.body.name, 
          location: req.body.location, 
          errors: errors, 
          breweries: breweries})
      });
    } else {
      lookups.addBrewery(req.body.name, req.body.location + ', CO').then(function() {
        res.redirect('/');
      })
    }
  })
});

router.get('/breweries/:id', function(req, res, next) {
  lookups.getBrewery(req.params.id).then(function(brewery) {
    lookups.getBeers(brewery.beerIds).then(function(beers) {
      res.render('brewery', { title: brewery.name, brewery: brewery, beers: beers });
    })
  })
})

router.post('/breweries/:id/beers', function(req, res, next) {
  lookups.addBeer(req.params.id, req.body.name, req.body.style, req.body.description, req.body.alcohol).then(function() {
    res.redirect('/breweries/' + req.params.id);
  });
});

router.get('/breweries/:breweryId/beers/:id', function(req, res, next) {
    lookups.getBeer(req.params.id).then(function(beer) {
      lookups.getAllTaps().then(function(allTaps) {
        lookups.getTaps(beer.tapIds).then(function(taps) {
          res.render('beer', { title: beer.name, beer: beer, taps: taps, allTaps: allTaps })
      })
    })
  })
});

router.post('/breweries/:breweryId/beers/:id/on-tap', function(req, res, next) {
  lookups.addTap(req.params.id, req.body.name).then(function() {
    res.redirect('/breweries/' + req.params.breweryId + '/beers/' + req.params.id);
  })
});

router.get('/taps/:id', function(req, res, next) {
  lookups.getTap(req.params.id).then(function(tap) {
    lookups.getBeers(tap.beerIds).then(function(beers) {
      res.render('tap', { title: tap.name, beers: beers, tap: tap });
    })
  })
})

module.exports = router;
