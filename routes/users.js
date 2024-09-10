const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const authVerifier = require('../src/controllers/authAdminVerifier');

// Routes
router.post('/create', authVerifier, userController.createUser);
router.get('/get', authVerifier, userController.getUser);

// Route for creating an admin session - for testing purposes ONLY
router.get('/get-admin-session', (req, res) => {
    req.session.user = {
        username: 'admin',
        types: ['user', 'admin']
    };
    res.send('Admin session created');
});

module.exports = router;
