const branchModel = require('../models/branchModel');

const branchController = {
    async listBranches(req, res) {
        const branches = await branchModel.find();
        res.status(200).send({status: 'Success', branches: branches});
    },

    async createBranch(req, res) {
        let name = req.body.name;
        let address = req.body.address;

        let branch = new branchModel({
            name: name,
            address: address
        });

        await branch.save().then(() => {
            res.status(201).send({status: 'Success', message: 'Branch created'});
        }).catch((error) => {
            console.error('Error creating branch:', error);
            res.status(500).send({status: 'Error', message: 'Error creating branch'});
        });
    },

    async deleteBranch(req, res) {
        const branch = await branchModel.findOneAndDelete({name: req.body.name});
        if (!branch) {
            res.status(404).send({status: 'Error', message: 'Branch not found'});
            return;
        }
        res.status(200).send({status: 'Success', branch: branch});
    },

    async updateBranch(req, res) {
        try {
            const branch = await branchModel.findOneAndUpdate(
                {name: req.query.name},
                {address: req.body.address},
                {new: true}
            );
            if (!branch) {
                res.status(404).send({status: 'Error', message: 'Branch not found'});
                return;
            }
            res.status(200).send({status: 'Success', branch: branch});
        } catch (error) {
            console.error('Error updating branch:', error);
            res.status(500).send({status: 'Error', message: 'Error updating branch'});
        }
    },

    async getBranch(req, res) {
        const branch = await branchModel.findOne({name: req.query.name});
        if (!branch) {
            res.status(404).send({status: 'Error', message: 'Branch not found'});
            return;
        }

        res.status(200).send({status: 'Success', branch: branch});
    }
}

module.exports = branchController;