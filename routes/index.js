var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/breweries');
var breweries = db.get('breweries');
var beers = db.get('beers');
var onTap = db.get('tap');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Colorado Breweries' });
});

module.exports = router;
