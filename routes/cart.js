const express = require('express');
const router = express.Router();
const cartController = require('../src/controllers/cartController');
const authUserVerifier = require('../src/controllers/authUserVerifier');


router.post('/add', authUserVerifier, cartController.addToCart);
router.delete('/remove', authUserVerifier,  cartController.removeFromCart)
router.get('/get', authUserVerifier, cartController.getCart)

module.exports = router;
