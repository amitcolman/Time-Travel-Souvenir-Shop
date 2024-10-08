const express = require('express');
const router = express.Router();
const path = require('path')
const authAdminVerifier = require("../src/controllers/authAdminVerifier");

router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/home.html'));
});

router.get('/about', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/about.html'));
});

router.get('/profile', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/profile.html'));
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

router.get('/admin-console/customer-management', authAdminVerifier, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/admin-console/customer-management.html'));
});

router.get('/checkout', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/checkout.html'));
});

router.get('/orderconfirm', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/orderconfirm.html'));
});

router.get('/admin-console/dashboards', authAdminVerifier, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/admin-console/dashboards.html'));
});

router.get('/admin-console/products-management', authAdminVerifier, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/admin-console/products-management.html'));
});

router.get('/admin-console/orders-management', authAdminVerifier, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/admin-console/orders-management.html'));
});

router.get('/products', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/products.html'));
});

router.get('/my-cart', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views/my-cart.html'));
});

module.exports = router;