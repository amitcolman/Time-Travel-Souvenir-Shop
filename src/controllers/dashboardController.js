const User = require('../models/userModel');
const Item = require('../models/itemModel');
const Branch = require('../models/branchModel');

const dashboardController = {
    // Total Users
    async getTotalUsers(req, res) {
        try {
            const totalUsers = await User.countDocuments({});
            res.status(200).json({ total: totalUsers });
        } catch (error) {
            console.error('Error fetching total users:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch total users' });
        }
    },

    // User Type Distribution
    async getUserTypeDistribution(req, res) {
        try {
            const userTypeDistribution = await User.aggregate([
                { $unwind: "$types" },
                { $group: { _id: "$types", count: { $sum: 1 } } }
            ]);
            res.status(200).json(userTypeDistribution.map(type => ({
                type: type._id, // Adjust according to how you store user types
                count: type.count
            })));
        } catch (error) {
            console.error('Error fetching user type distribution:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch user type distribution' });
        }
    },

    // Top Users by Orders (Stubbed due to no Orders model)
    async getTopUsers(req, res) {
        // Replace this logic with actual query when the Orders model is ready.
        try {
            const topUsers = await User.find({}) // Modify once orders are implemented
                .sort({ orderCount: -1 }) // Assuming there’s an orderCount field in User
                .limit(5)
                .select('username orderCount');
            res.status(200).json(topUsers);
        } catch (error) {
            console.error('Error fetching top users:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch top users' });
        }
    },

    // Items per Country
    async getItemsByCountry(req, res) {
        try {
            const itemsByCountry = await Item.aggregate([
                { $group: { _id: "$country", count: { $sum: 1 } } }
            ]);
            res.status(200).json(itemsByCountry.map(country => ({
                country: country._id,
                count: country.count
            })));
        } catch (error) {
            console.error('Error fetching items by country:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch items by country' });
        }
    },

    // Low Stock Items
    async getLowStockItems(req, res) {
        try {
            const lowStockItems = await Item.find({ quantity: { $lt: 10 } }) // Assuming less than 10 is low stock
                .select('itemName quantity');
            res.status(200).json(lowStockItems);
        } catch (error) {
            console.error('Error fetching low stock items:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch low stock items' });
        }
    },

    // Top Most Expensive Items
    async getTopExpensiveItems(req, res) {
        try {
            const topExpensiveItems = await Item.find({})
                .sort({ price: -1 })
                .limit(5)
                .select('itemName price');
            res.status(200).json(topExpensiveItems);
        } catch (error) {
            console.error('Error fetching top expensive items:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch top expensive items' });
        }
    },

    // Top Most Ancient Items
    async getTopAncientItems(req, res) {
        try {
            const topAncientItems = await Item.find({})
                .sort({ year: 1 }) // Oldest items first
                .limit(5)
                .select('itemName year');
            res.status(200).json(topAncientItems);
        } catch (error) {
            console.error('Error fetching top ancient items:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch top ancient items' });
        }
    },

    // Top 5 Most Successful Branches (Stubbed due to missing Orders model)
    async getTopBranches(req, res) {
        // Add real logic here when orders data is available
        try {
            const topBranches = await Branch.find({})
                .sort({ successMetric: -1 }) // Assuming there is some success metric or orders
                .limit(5)
                .select('branchName successMetric');
            res.status(200).json(topBranches);
        } catch (error) {
            console.error('Error fetching top branches:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch top branches' });
        }
    },

    // Items per Branch
    async getItemsPerBranch(req, res) {
        try {
            const itemsPerBranch = await Item.aggregate([
                { $group: { _id: "$branch", count: { $sum: 1 } } }
            ]);
            res.status(200).json(itemsPerBranch.map(branch => ({
                branch: branch._id,
                count: branch.count
            })));
        } catch (error) {
            console.error('Error fetching items per branch:', error);
            res.status(500).json({ status: 'Error', message: 'Failed to fetch items per branch' });
        }
    },

    // Sales by Branch (Stubbed due to missing Orders model)
    async getSalesByBranch(req, res) {
        // Stubbed since Orders model isn't available yet
        res.status(200).json([]);
    }
};

module.exports = dashboardController;
