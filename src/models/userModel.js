const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 16,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 16
    },
    types: [
        {
            type: String,
            required: true,
            enum: ['admin', 'user'],
            default: 'user'
        }
    ],
    cart: [
        {
            type: String,
            required: true,
            ref: "Items"
        }
    ]
});

module.exports = mongoose.model('Users', userSchema);