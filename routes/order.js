const express = require('express');
const router = express.Router();
const orderController = require('../src/controllers/orderController');
const authUserVerifier = require('../src/controllers/authUserVerifier');

// Routes
router.post('/add', authUserVerifier, orderController.createOrder);
router.delete('/remove', authUserVerifier,  orderController.deleteOrder)
//router.get('/get', authUserVerifier, cartController.getCart)

module.exports = router;
