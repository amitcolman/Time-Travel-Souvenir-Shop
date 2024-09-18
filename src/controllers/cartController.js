const itemModel = require('../models/itemModel');
const userModel = require('../models/userModel');

const cartController = {
    async addToCart(req, res) {
        
        let itemName = req.body.itemName
        const item = await itemModel.findOne({itemName: itemName});
        if (!item) {
            res.status(404).send({status: 'Error', message: 'Item not found'});
            return;
        }
        if (item.quantity === 0){
            res.status(410).send({status: 'Error', message: 'Item not in stock'});
            return;
        }
        let username = req.session.user.username;
        let cartItem = {cart: itemName}
        const user = await userModel.findOneAndUpdate({ username: username }, { $push: cartItem }, {new: true});
        if (!user) {
            res.status(404).send({status: 'Error', message: 'User not found'});
            return;
        }
        res.status(201).send({status: 'Success', message: 'Item added to cart'});
    },

    async removeFromCart(req, res) {
        let itemName = req.body.itemName
        let username = req.session.user.username;
        let cartItem = {cart: itemName};
        const user = await userModel.findOneAndUpdate({ username: username }, { $pull: cartItem }, {new: true});
        if (!user) {
            res.status(404).send({status: 'Error', message: 'User not found'});
            return;
        }
        res.status(201).send({status: 'Success', message: 'Item removed from cart'});
    },
    async getCart(req, res) {
        let username = req.session.user.username;
        const user = await userModel.findOne({ username: username })
        if (!user) {
            res.status(404).send({status: 'Error', message: 'User not found'});
            return;
        }

        res.status(200).send({status: 'Success', cart: user.cart});
    }
}

module.exports = cartController;