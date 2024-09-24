const express = require('express');
const router = express.Router();
const orderController = require('../src/controllers/orderController');
const authUserVerifier = require('../src/controllers/authUserVerifier');
const authAdminVerifier = require("../src/controllers/authAdminVerifier");


router.post('/add', authUserVerifier, orderController.createOrder);
router.delete('/remove', authUserVerifier,  orderController.deleteOrder)
router.get('/get-user-orders', authUserVerifier, orderController.getLoggedInUserOrders);
router.get('/get-all-orders', authAdminVerifier, orderController.getAllOrders);

module.exports = router;
