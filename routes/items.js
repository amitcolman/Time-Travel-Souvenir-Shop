const express = require('express');
const router = express.Router();
const itemController = require('../src/controllers/itemController');
const authAdminVerifier = require("../src/controllers/authAdminVerifier");
const authUserVerifier = require('../src/controllers/authUserVerifier');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/products/img');
    },
    filename: function (req, file, cb) {
        const productName = req.body.itemName.replace(/\s+/g, '_');
        const extension = file.originalname.split('.').pop();
        cb(null, `${productName}.${extension}`);
    }
});
const upload = multer({ storage: storage });


router.post('/create', authAdminVerifier, upload.single('picture'), itemController.createItem);
router.get('/get', itemController.getItem);
router.post('/update', authAdminVerifier, itemController.updateItem)
router.get('/quantity-remove-one', authUserVerifier,  itemController.quantityRemoveOne)
router.delete('/delete', authAdminVerifier, itemController.deleteItem )
router.get('/list', itemController.listItems)
router.get('/countries', itemController.listCountries)
router.get('/price-range', itemController.getPriceRange);
router.get('/range-values', authAdminVerifier, itemController.getRangeValues)


module.exports = router;