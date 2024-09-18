const orderModel = require('../models/ordersModel');
const UserModel = require("../models/userModel");



const orderController = {
    async createOrder(req, res) {
        let id = req.body.orderId;
        let items = req.body.items;
        let total = req.body.total;
        let username = req.session.user.username;

        let order = new orderModel({
            username:username,
            orderId: id,
            items: items,
            total: total
        });

        await order.save().then(() => {
            res.status(201).send({status: 'Success', message: 'order created'});
        }).catch((error) => {
            console.error('Error creating order:', error);
            res.status(500).send({status: 'Error', message: 'Error creating order'});
        });
    },

    async deleteOrder(req, res) {
        console.log('Request body:', req.body);


        const id = await orderModel.findOneAndDelete({orderId: req.body.orderId});

        if (!id) {
            res.status(404).send({status: 'Error', message: 'order not found'});
            return;
        }

        res.status(200).send({status: 'Success', message: 'order deleted'});
    }
}


module.exports = orderController;