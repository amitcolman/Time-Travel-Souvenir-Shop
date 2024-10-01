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
        let cartItem = itemName

        const user = await userModel.findOne({ username: username });
        if (!user) {
            res.status(404).send({ status: 'Error', message: 'User not found' });
            return;
        }

        if (user.cart.includes(cartItem)) {
            res.status(400).send({ status: 'Error', message: 'Item already in cart' });
            return;
        }

        user.cart.push(cartItem);
        await user.save().then(() => {
            res.status(201).send({status: 'Success', message: 'Item added to cart'});
        }).catch((error) => {
            console.error('Error adding item:', error);
            res.status(500).send({status: 'Error', message: 'Error adding item to cart'});
        });


    },

    async removeFromCart(req, res) {
        let itemName = req.query.itemName
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