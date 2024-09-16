const express = require('express');
const router = express.Router();
const branchController = require('../src/controllers/branchController');
const authAdminVerifier = require("../src/controllers/authAdminVerifier");

// Routes
router.get('/list', branchController.listBranches);
router.post('/create', authAdminVerifier, branchController.createBranch);
router.post('/delete', authAdminVerifier, branchController.deleteBranch);
router.post('/update', authAdminVerifier, branchController.updateBranch);

module.exports = router;