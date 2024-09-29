const express = require('express');
const router = express.Router();
const dashboardController = require('../src/controllers/dashboardController');
const authAdminVerifier = require('../src/controllers/authAdminVerifier');

router.get('/total-users', authAdminVerifier, dashboardController.getTotalUsers);
router.get('/user-type-distribution', authAdminVerifier, dashboardController.getUserTypeDistribution);
router.get('/top-users', authAdminVerifier, dashboardController.getTopUsers);
router.get('/items-by-country', authAdminVerifier, dashboardController.getItemsByCountry);
router.get('/low-stock-items', authAdminVerifier, dashboardController.getLowStockItems);
router.get('/top-expensive-items', authAdminVerifier, dashboardController.getTopExpensiveItems);
router.get('/top-ancient-items', authAdminVerifier, dashboardController.getTopAncientItems);
router.get('/top-branches', authAdminVerifier, dashboardController.getTopBranches);
router.get('/items-per-branch', authAdminVerifier, dashboardController.getItemsPerBranch);
router.get('/sales-by-branch', authAdminVerifier, dashboardController.getSalesByBranch);

module.exports = router;
