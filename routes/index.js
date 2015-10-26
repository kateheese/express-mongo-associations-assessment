var express = require('express');
var router = express.Router();
var lookups = require('../lib/lookups.js');

router.get('/', function(req, res, next) {
  lookups.getBreweries().then(function(breweries) {
    res.render('index', { title: 'Colorado Breweries', breweries: breweries });
  });
});

module.exports = router;
