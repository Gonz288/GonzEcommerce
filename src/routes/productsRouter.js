const express = require("express");
const productsRouter = express.Router();
const {getAllProducts, getProductsByCategory, getProductsBySearch,createProduct, deleteProduct, updateProduct} = require("../controllers/products.controllers");

productsRouter.get("/", getAllProducts);

productsRouter.get("/:category", getProductsByCategory);

productsRouter.get("/search/product", getProductsBySearch);

productsRouter.post("/",createProduct);

productsRouter.delete("/delete/:id", deleteProduct);

productsRouter.put("/put/:id", updateProduct);

module.exports = productsRouter;