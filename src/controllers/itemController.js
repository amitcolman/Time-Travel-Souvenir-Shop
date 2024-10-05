const itemModel = require('../models/itemModel');
const fs = require('fs');
const path = require('path');


const itemController = {
    async createItem(req, res) {
        let itemName = req.body.itemName;
        let country = req.body.country;
        let period = req.body.period;
        let year = req.body.year;
        let price = req.body.price;
        let quantity = req.body.quantity;
        let picture = req.file.filename;
        let branch = req.body.branch;

        
        let item_exists = await itemModel.exists({itemName: itemName});
        if (item_exists) {
            res.status(409).send({status: 'Error', message: 'Item already exists'});
            return;
        }

        
        let item = new itemModel({
            itemName: itemName,
            country: country,
            period: period,
            year: year,
            price: price,
            quantity: quantity,
            picture: picture,
            branch: branch
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


    async updateItem(req, res) {
        try {
            const updates = {};

            if (req.body.period) {
                updates.period = req.query.period;
            }

            if (req.body.year) {
                updates.year = req.body.year;
            }

            if (req.body.branch) {
                updates.branch = req.body.branch;
            }

            if (req.body.country) {
                updates.country = req.query.country;
            }

            if (req.body.price) {
                updates.price = req.body.price;
            }

            if (req.body.picture) {
                updates.picture = req.body.picture;
            }

            if (req.body.quantity) {
                updates.quantity = req.body.quantity;
            }
            const item = await itemModel.findOneAndUpdate({itemName: req.body.itemName}, updates, {new: true});
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


    async quantityRemoveOne(req, res) {
        try {
            const item = await itemModel.findOneAndUpdate({itemName: req.query.itemName}, {$inc: {quantity: -1}}, {new: true});
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
            const item = await itemModel.findOneAndDelete({itemName: req.body.itemName});
            if (!item) {
                res.status(404).send({status: 'Error', message: 'Item not found'});
                return;
            }

            const picturePath = path.join(__dirname, '..', 'public', 'products', 'img', item.picture);
            fs.unlink(picturePath, (err) => {
                if (err) {
                    console.error('Error deleting the image file:', err);
                }
            });

            res.status(200).send({status: 'Success', item: item});
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).send({status: 'Error', message: 'Error deleting item'});
        }
    },


    async listItems(req, res) {
        try {
            const filters = {};

            if (req.query.period) {
                filters.period = req.query.period;
            }

            if (req.query.minYear) {
                filters.year = { ...filters.year, $gte: parseFloat(req.query.minYear) };
            }

            if (req.query.maxYear) {
                filters.year = { ...filters.year, $lte: parseFloat(req.query.maxYear) };
            }

            if (req.query.country) {
                filters.country = req.query.country;
            }

            if (req.query.minPrice) {
                filters.price = { ...filters.price, $gte: parseFloat(req.query.minPrice) };
            }

            if (req.query.maxPrice) {
                filters.price = { ...filters.price, $lte: parseFloat(req.query.maxPrice) };
            }

            const items = await itemModel.find(filters);

            if (!items || items.length === 0) {
                res.status(404).send({ status: 'Error', message: 'No items found' });
                return;
            }
            res.status(200).send({ status: 'Success', item: items });
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(500).send({ status: 'Error', message: 'Error fetching items' });
        }
    },


    async listCountries(req, res){
        try{
            const countries = await itemModel.distinct('country');

            if (!countries || countries.length === 0) {
                res.status(404).send({ status: 'Error', message: 'No items found' });
                return;
            }
            res.status(200).send({ status: 'Success', countries: countries });
        } catch (error) {
            console.error('Error fetching countries:', error);
            res.status(500).send({ status: 'Error', message: 'Error fetching countries' });
        }
    },

    async getPriceRange(req, res) {
        try {
            const result = await itemModel.aggregate([
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: "$price" },
                        maxPrice: { $max: "$price" }
                    }
                }
            ]);
            if (!result || result.length === 0) {
                return res.status(404).send({ status: 'Error', message: 'No items found' });
            }
            const { minPrice, maxPrice } = result[0];
            res.status(200).send({ status: 'Success', minPrice, maxPrice });
        } catch (error) {
            console.error('Error fetching price range:', error);
            res.status(500).send({ status: 'Error', message: 'Error fetching price range' });
        }
    },
    async getRangeValues(req, res) {
        try {
            const result = await itemModel.aggregate([
                {
                    $group: {
                        _id: null,
                        minYear: { $min: "$year" },
                        maxYear: { $max: "$year" },
                        minPrice: { $min: "$price" },
                        maxPrice: { $max: "$price" },
                        minQuantity: { $min: "$quantity" },
                        maxQuantity: { $max: "$quantity" }
                    }
                }
            ]);

            if (!result || result.length === 0) {
                return res.status(404).send({ status: 'Error', message: 'No items found' });
            }

            const { minYear, maxYear, minPrice, maxPrice, minQuantity, maxQuantity } = result[0];
            res.status(200).send({ status: 'Success', minYear, maxYear, minPrice, maxPrice, minQuantity, maxQuantity });
        } catch (error) {
            console.error('Error fetching range values:', error);
            res.status(500).send({ status: 'Error', message: 'Error fetching range values' });
        }
    }
}

module.exports = itemController;