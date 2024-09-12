var express = require('express');
var router = express.Router();
const path = require('path')

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/signup', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
});

module.exports = router;
