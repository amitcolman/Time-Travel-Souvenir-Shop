const express = require('express');
const router = express.Router();
const wikiController = require('../src/controllers/wikiController');

// Routes
router.get('/onthisday', wikiController.fetchOnThisDayData);

module.exports = router;
