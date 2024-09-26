const orderModel = require('../models/ordersModel');

const orderController = {
    async createOrder(req, res) {
        let id = req.body.orderId;
        let items = req.body.items;
        let total = req.body.total;
        let username = req.session.user.username;

        let order = new orderModel({
            username: username,
            orderId: id,
            items: items,
            total: total
        });

        await order.save().then(() => {
            res.status(201).send({ status: 'Success', message: 'Order created' });
        }).catch((error) => {
            console.error('Error creating order:', error);
            res.status(500).send({ status: 'Error', message: 'Error creating order' });
        });
    },

    async deleteOrder(req, res) {
        const id = await orderModel.findOneAndDelete({ orderId: req.body.orderId });

        if (!id) {
            res.status(404).send({ status: 'Error', message: 'Order not found' });
            return;
        }

        res.status(200).send({ status: 'Success', message: 'Order deleted' });
    },

    async getLoggedInUserOrders(req, res) {
        let username = req.session.user.username;
        const orders = await orderModel.find({ username: username });
        if (!orders) {
            res.status(404).send({ status: 'Error', message: 'Orders not found' });
            return;
        }

        res.status(200).json(orders);
    },

    async getAllOrders(req, res) {
        try {
            const orders = await orderModel.find();
            res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ message: 'Error fetching orders' });
        }
    },

    async updateOrder(req, res) {
        try {
            const { orderId, items, total } = req.body;

            const updatedOrder = await orderModel.findOneAndUpdate(
                { orderId: orderId },
                { $set: { items: items, total: total } },
                { new: true }
            );

            if (!updatedOrder) {
                return res.status(404).send({ status: 'Error', message: 'Order not found' });
            }

            res.status(200).send({ status: 'Success', message: 'Order updated', updatedOrder });
        } catch (error) {
            console.error('Error updating order:', error);
            res.status(500).send({ status: 'Error', message: 'Error updating order' });
        }
    }
};

module.exports = orderController;