var express = require('express');
var router = express.Router();
var lookups = require('../lib/lookups.js');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Colorado Breweries' });
});

module.exports = router;
