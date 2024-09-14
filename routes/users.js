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

// Route for creating an admin session - for testing purposes ONLY
router.get('/get-admin-session', (req, res) => {
    req.session.user = {
        username: 'admin',
        types: ['user', 'admin']
    };
    res.send('Admin session created');
});

// Route to get distinct user roles (types)
router.get('/get-user-roles', authAdminVerifier, async function(req, res) {
    try {
        const roles = await UserModel.distinct('types'); // Fetch distinct roles from the 'types' field
        res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error fetching roles' });
    }
});

module.exports = router;
