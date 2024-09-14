const branchModel = require('../models/branchModel');

const branchController = {
    async listBranches(req, res) {
        const branches = await branchModel.find();
        res.status(200).send({status: 'Success', branches: branches});
    }
}

module.exports = branchController;