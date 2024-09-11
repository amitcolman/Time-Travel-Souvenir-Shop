const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const authUserVerifier = require('../src/controllers/authUserVerifier');
const authAdminVerifier = require('../src/controllers/authAdminVerifier');

// Routes
router.post('/create', authAdminVerifier, userController.createUser);
router.get('/get', authAdminVerifier, userController.getUser);
router.post('/login', userController.loginUser);
router.get('/logout', authUserVerifier, userController.logoutUser);
router.post('/update-password', authUserVerifier, userController.updateUserPassword);
router.post('/delete', authAdminVerifier, userController.deleteUser);

// Route for creating an admin session - for testing purposes ONLY
router.get('/get-admin-session', (req, res) => {
    req.session.user = {
        username: 'admin',
        types: ['user', 'admin']
    };
    res.send('Admin session created');
});

module.exports = router;
