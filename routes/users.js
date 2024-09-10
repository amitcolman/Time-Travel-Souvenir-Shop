const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const authVerifier = require('../src/controllers/authAdminVerifier');

// Route for creating a user
router.post('/create', authVerifier, userController.createUser);

// Route for creating an admin session - for testing purposes ONLY
router.get('/get-admin-session', (req, res) => {
    req.session.user = {
        username: 'admin',
        types: ['user', 'admin']
    };
    res.send('Admin session created');
});

module.exports = router;
