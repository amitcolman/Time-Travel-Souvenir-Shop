const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const UserModel = require('../src/models/userModel');
const authUserVerifier = require('../src/controllers/authUserVerifier');
const authAdminVerifier = require('../src/controllers/authAdminVerifier');

// Routes
router.post('/create', userController.createUser);
router.get('/get', authAdminVerifier, userController.getUser);
router.get('/get-all-users', authAdminVerifier ,userController.getAllUsers);
router.post('/login', userController.loginUser);
router.get('/logout', authUserVerifier, userController.logoutUser);
router.get('/get-session', userController.getSession);
router.post('/update-password', authUserVerifier, userController.updateUserPassword);
router.post('/delete', authAdminVerifier, userController.deleteUser);
router.get('/get-user-roles', authAdminVerifier, userController.getUserRoles);
router.post('/authorize', authAdminVerifier, userController.authorize);


// Route for creating an admin session - for testing purposes ONLY
router.get('/get-admin-session', (req, res) => {
    req.session.user = {
        username: 'admin',
        types: ['user', 'admin']
    };
    res.send('Admin session created');
});

module.exports = router;
