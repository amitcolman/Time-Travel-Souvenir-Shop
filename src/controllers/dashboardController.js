const User = require('../models/userModel');
const Item = require('../models/itemModel');
const Order = require('../models/ordersModel');

const dashboardController = {
    
    async getTotalUsers(req, res) {
        try {
            const totalUsers = await User.countDocuments({});
            res.status(200).json({total: totalUsers});
        } catch (error) {
            console.error('Error fetching total users:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch total users'});
        }
    },

    
    async getUserTypeDistribution(req, res) {
        try {
            const userTypeDistribution = await User.aggregate([
                {$unwind: "$types"},
                {$group: {_id: "$types", count: {$sum: 1}}}
            ]);
            res.status(200).json(userTypeDistribution.map(type => ({
                type: type._id,
                count: type.count
            })));
        } catch (error) {
            console.error('Error fetching user type distribution:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch user type distribution'});
        }
    },

    
    async getTopUsers(req, res) {
        try {
            const topUsers = await Order.aggregate([
                {$group: {_id: "$username", orderCount: {$sum: 1}}},
                {$sort: {orderCount: -1}},
                {$limit: 5}
            ]);
            res.status(200).json(topUsers.map(user => ({
                username: user._id,
                orderCount: user.orderCount
            })));
        } catch (error) {
            console.error('Error fetching top users:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch top users'});
        }
    },

    
    async getItemsByCountry(req, res) {
        try {
            const itemsByCountry = await Item.aggregate([
                {$group: {_id: "$country", count: {$sum: 1}}}
            ]);
            res.status(200).json(itemsByCountry.map(country => ({
                country: country._id,
                count: country.count
            })));
        } catch (error) {
            console.error('Error fetching items by country:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch items by country'});
        }
    },

    
    async getLowStockItems(req, res) {
        try {
            const lowStockItems = await Item.find({quantity: {$lt: 10}})
                .select('itemName quantity');
            res.status(200).json(lowStockItems);
        } catch (error) {
            console.error('Error fetching low stock items:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch low stock items'});
        }
    },

    
    async getTopExpensiveItems(req, res) {
        try {
            const topExpensiveItems = await Item.find({})
                .sort({price: -1})
                .limit(5)
                .select('itemName price');
            res.status(200).json(topExpensiveItems);
        } catch (error) {
            console.error('Error fetching top expensive items:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch top expensive items'});
        }
    },

    
    async getTopAncientItems(req, res) {
        try {
            const topAncientItems = await Item.find({})
                .sort({year: 1})  
                .limit(5)
                .select('itemName year');
            res.status(200).json(topAncientItems);
        } catch (error) {
            console.error('Error fetching top ancient items:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch top ancient items'});
        }
    },

    async getTopBranches(req, res) {
        try {
            const topBranches = await Order.aggregate([
                {
                    
                    $unwind: "$items"
                },
                {
                    
                    $lookup: {
                        from: 'items',  
                        localField: 'items',  
                        foreignField: 'itemName',  
                        as: 'itemDetails'  
                    }
                },
                {
                    
                    $unwind: "$itemDetails"
                },
                {
                    
                    $group: {
                        _id: "$itemDetails.branch",  
                        totalOrders: {$sum: 1}  
                    }
                },
                {
                    
                    $sort: {totalOrders: -1}
                },
                {
                    
                    $limit: 5
                }
            ]);

            
            res.status(200).json(topBranches.map(branch => ({
                branch: branch._id,  
                totalOrders: branch.totalOrders
            })));
        } catch (error) {
            console.error('Error fetching top branches:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch top branches'});
        }
    }
    ,

    
    async getItemsPerBranch(req, res) {
        try {
            const itemsPerBranch = await Item.aggregate([
                {$group: {_id: "$branch", count: {$sum: 1}}}
            ]);
            res.status(200).json(itemsPerBranch.map(branch => ({
                branch: branch._id,
                count: branch.count
            })));
        } catch (error) {
            console.error('Error fetching items per branch:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch items per branch'});
        }
    },

    
    async getSalesByBranch(req, res) {
        try {
            const salesByBranch = await Order.aggregate([
                {
                    
                    $unwind: "$items"
                },
                {
                    
                    $lookup: {
                        from: 'items',  
                        localField: 'items',  
                        foreignField: 'itemName',  
                        as: 'itemDetails'  
                    }
                },
                {
                    
                    $unwind: "$itemDetails"
                },
                {
                    
                    $group: {
                        _id: "$itemDetails.branch",  
                        totalSales: {$sum: "$total"}  
                    }
                },
                {
                    
                    $sort: {totalSales: -1}
                }
            ]);

            
            res.status(200).json(salesByBranch.map(branch => ({
                branch: branch._id,  
                totalSales: branch.totalSales  
            })));
        } catch (error) {
            console.error('Error fetching sales by branch:', error);
            res.status(500).json({status: 'Error', message: 'Failed to fetch sales by branch'});
        }
    }

};

module.exports = dashboardController;
