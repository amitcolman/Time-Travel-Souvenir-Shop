const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    orderId :  {
        type: String,
        required: true

    },

    items: [String],

    total: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model('Orders', ordersSchema);