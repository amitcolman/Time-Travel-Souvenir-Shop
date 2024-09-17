const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true,
    },
    period: {
        type: String,
        required: true,
        enum: ['past', 'present', 'future'],
    },
    year: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    picture: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true,
        ref: 'Branches'
    }
});

module.exports = mongoose.model('Items', itemSchema);