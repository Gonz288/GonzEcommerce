const mongoose = require("mongoose");

const productCollection = "products";

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    thumbnail: String,
    stock: Number,
    category: String,
    status: Boolean,
});

const productModel = mongoose.model(productCollection, productSchema);

module.exports =  productModel;