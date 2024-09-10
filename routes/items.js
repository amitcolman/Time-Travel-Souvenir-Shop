const express = require('express');
const router = express.Router();
const itemController = require('../src/controllers/itemController');

// Routes
router.post('/create', itemController.createItem);
router.get('/get', itemController.getItem);
router.post('/update-quantity', itemController.updateItemQuantity)
router.delete('/delete',itemController.deleteItem )

module.exports = router;
