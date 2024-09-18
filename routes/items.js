const express = require('express');
const router = express.Router();
const itemController = require('../src/controllers/itemController');
const authAdminVerifier = require("../src/controllers/authAdminVerifier");


router.post('/create', authAdminVerifier, itemController.createItem);
router.get('/get', itemController.getItem);
router.post('/update-quantity', authAdminVerifier,  itemController.updateItemQuantity)
router.delete('/delete', authAdminVerifier, itemController.deleteItem )
router.get('/list', itemController.listItems)

module.exports = router;
