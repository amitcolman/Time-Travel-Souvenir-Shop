const UserModel = require('../models/userModel');

const userController = {
    async createUser(req, res) {
        let username = req.body.username;
        let password = req.body.password;

        // Validate if username is already taken
        let user_exists = await UserModel.exists({ username: username });
        if (user_exists) {
            res.status(409).send({status: 'Error', message: 'Username already taken'});
            return;
        }

        // Validate username length
        if (username.length < 3 || username.length > 16) {
            res.status(400).send({status: 'Error', message: 'Username must be between 3 and 16 characters'});
            return;
        }

        // Validate password length
        if (password.length < 8 || password.length > 16) {
            res.status(400).send({status: 'Error', message: 'Password must be between 8 and 16 characters'});
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
    }
}

module.exports = userController;