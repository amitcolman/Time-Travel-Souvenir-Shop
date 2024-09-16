const itemModel = require('../models/itemModel');

const itemController = {
    async createItem(req, res) {
        let itemName = req.body.itemName;
        let country = req.body.country;
        let period = req.body.period;
        let year = req.body.year;
        let price = req.body.price;
        let quantity = req.body.quantity;
        let picture = req.body.picture;

        // Validate if item already exists
        let item_exists = await itemModel.exists({itemName: itemName});
        if (item_exists) {
            res.status(409).send({status: 'Error', message: 'Item already exists'});
            return;
        }

        // Adds new item
        let item = new itemModel({
            itemName: itemName,
            country: country,
            period: period,
            year: year,
            price: price,
            quantity: quantity,
            picture: picture,
        });

        await item.save().then(() => {
            res.status(201).send({status: 'Success', message: 'Item added to inventory'});
        }).catch((error) => {
            console.error('Error adding item:', error);
            res.status(500).send({status: 'Error', message: 'Error adding item'});
        });
    },
    async getItem(req, res) {
        const item = await itemModel.findOne({itemName: req.query.itemName});
        if (!item) {
            res.status(404).send({status: 'Error', message: 'Item not found'});
            return;
        }
        res.status(200).send({status: 'Success', item: item});
    },

    async updateItemQuantity(req, res) {
        try {
            const item = await itemModel.findOneAndUpdate({itemName: req.query.itemName}, {quantity: req.body.quantity}, {new: true});
            if (!item) {
                res.status(404).send({status: 'Error', message: 'Item not found'});
                return;
            }
            res.status(200).send({status: 'Success', item: item});
        } catch (error) {
            console.error('Error updating quantity:', error);
            res.status(500).send({status: 'Error', message: 'Error updating quantity'});
        }
    },
    async deleteItem(req, res) {
        try {
            const item = await itemModel.findOneAndDelete({itemName: req.query.itemName});
            if (!item) {
                res.status(404).send({status: 'Error', message: 'Item not found'});
                return;
            }
            res.status(200).send({status: 'Success', item: item});
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).send({status: 'Error', message: 'Error deleting item'});
        }
    },
    async listItems(req, res) {
        const items = await itemModel.find({});
        if (!items) {
            res.status(404).send({status: 'Error', message: 'No items found'});
            return;
        }
        res.status(200).send({status: 'Success', item: items});
    },

}

module.exports = itemController;