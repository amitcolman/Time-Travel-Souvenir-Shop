const express = require('express');
const router = express.Router();
const branchController = require('../src/controllers/branchController');

// Routes
router.get('/list', branchController.listBranches);

module.exports = router;