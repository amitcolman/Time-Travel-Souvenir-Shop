const express = require('express');
const router = express.Router();
const wikiController = require('../src/controllers/wikiController');


router.get('/onthisday', wikiController.fetchOnThisDayData);

module.exports = router;
