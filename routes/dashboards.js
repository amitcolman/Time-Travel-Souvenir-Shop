const express = require('express');
const router = express.Router();
const dashboardController = require('../src/controllers/dashboardController');

router.get('/total-users', dashboardController.getTotalUsers);
router.get('/user-type-distribution', dashboardController.getUserTypeDistribution);
router.get('/top-users', dashboardController.getTopUsers);
router.get('/items-by-country', dashboardController.getItemsByCountry);
router.get('/low-stock-items', dashboardController.getLowStockItems);
router.get('/top-expensive-items', dashboardController.getTopExpensiveItems);
router.get('/top-ancient-items', dashboardController.getTopAncientItems);
router.get('/top-branches', dashboardController.getTopBranches);
router.get('/items-per-branch', dashboardController.getItemsPerBranch);
router.get('/sales-by-branch', dashboardController.getSalesByBranch);

module.exports = router;
