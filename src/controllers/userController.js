const UserModel = require('../models/userModel');

function validateUsernameAndPassword(username, password, res) {
    // Validate username length
    if (username.length < 3 || username.length > 16) {
        res.status(400).send({ status: 'Error', message: 'Username must be between 3 and 16 characters' });
        return false;
    }

    // Validate password length
    if (password.length < 8 || password.length > 16) {
        res.status(400).send({ status: 'Error', message: 'Password must be between 8 and 16 characters' });
        return false;
    }

    return true;
}

const userController = {

    async createUser(req, res) {
        let username = req.body.username;
        let password = req.body.password;

        // Validate if username is already taken
        let user_exists = await UserModel.exists({username: username});
        if (user_exists) {
            res.status(409).send({status: 'Error', message: 'Username already taken'});
            return;
        }

        if (!validateUsernameAndPassword(username, password, res)) {
            return; 
        }

        // Create new user
        let user = new UserModel({
            username: username,
            password: password,
            types: ['user']
        });

        await user.save().then(() => {
            res.status(201).send({status: 'Success', message: 'User created'});
        }).catch((error) => {
            console.error('Error creating user:', error);
            res.status(500).send({status: 'Error', message: 'Error creating user'});
        });
    },

    async getUser(req, res) {
        const user = await UserModel.findOne({username: req.query.username});
        if (!user) {
            res.status(404).send({status: 'Error', message: 'User not found'});
            return;
        }

        res.status(200).send({status: 'Success', user: user});
    },

    async getAllUsers(req, res) {
        try {
            const users = await UserModel.find();
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({message: 'Error fetching users'});
        }
    },

    async loginUser(req, res) {
        let username = req.body.username;
        let password = req.body.password;

        const user = await UserModel.findOne({username: username, password: password});
        if (!user) {
            res.status(401).send({status: 'Error', message: 'Invalid username or password'});
            return;
        }

        req.session.user = user;
        res.status(200).send({status: 'Success', message: 'User logged in'});
    },

    async logoutUser(req, res) {
        req.session.destroy();
        res.status(200).send({status: 'Success', message: 'User logged out'});
    },

    async getSession(req, res) {
        if (req.session.user) {
            res.status(200).send({status: 'Success', message: 'Session found', user: req.session.user});
        } else {
            res.status(404).send({status: 'Error', message: 'Session not found'});
        }
    },

    async deleteUser(req, res) {
        const user = await UserModel.findOneAndDelete({username: req.body.username});
        if (!user) {
            res.status(404).send({status: 'Error', message: 'User not found'});
            return;
        }

        res.status(200).send({status: 'Success', message: 'User deleted'});
    },

    async updateUserPassword(req, res) {
        let username = req.body.username;
        let password = req.body.password;

        if (req.session.user.username !== username && !req.session.user.types.includes('admin')) {
            res.status(403).send({status: 'Error', message: 'Access denied: User can only update their own password'});
        }

        if (!validateUsernameAndPassword(username, password, res)) {
            return; 
        }

        const user = await UserModel.findOneAndUpdate({username: username}, {password: password});
        if (!user) {
            res.status(404).send({status: 'Error', message: 'User not found'});
            return;
        }

        res.status(200).send({status: 'Success', message: 'User updated'});
    },

    async getUserRoles(req, res) {
        try {
            const roles = await UserModel.distinct('types');
            res.status(200).json(roles);
        } catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({message: 'Error fetching roles'});
        }
    },

    async authorize(req, res) {
        const password = req.body;
        try {
            const user = await UserModel.findOne({username: req.session.user.username});
            if (!user) {
                return res.status(404).json({status: 'Error', message: 'User not found'});
            }
            if (user.password !== password) {
                return res.status(401).json({status: 'Error', message: 'Incorrect password'});
            }
            res.status(200).json({status: 'Success', message: 'Authorized'});
        } catch (error) {
            res.status(500).json({status: 'Error', message: 'Server error'});
        }
    }
}

module.exports = userController;