const config = require("../config/config");
const mongoose = require("mongoose");
const {logger} = require("../config/utils");

switch (config.persistence){
    case "MONGO":
        const connection = mongoose.connect(`mongodb+srv://${config.DB_USER}:${config.DB_PASS}@codercluster.zrkv6ij.mongodb.net/${config.DB_NAME}?retryWrites=true&w=majority`)
        logger.info("Connected to MongoDB");
        const ProductManager = require("./mongo/ProductManager");
        const CartManager  = require("./mongo/CartManager");
        Products = ProductManager;
        Carts = CartManager;
    break;
}

module.exports = {Carts,Products};