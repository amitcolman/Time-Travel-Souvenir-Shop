var express = require('express');
var router = express.Router();
const path = require('path')
const authAdminVerifier = require("../src/controllers/authAdminVerifier");

router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/home.html'));
});

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/signup', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
});

router.get('/admin-console', authAdminVerifier, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/admin-console/admin-console.html'));
});

module.exports = router;
