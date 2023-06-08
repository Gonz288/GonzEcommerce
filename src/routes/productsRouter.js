const express = require("express");
const productsRouter = express.Router();
const {getAllProducts, getProductsByCategory, getProductsBySearch,createProduct, deleteProduct, updateProduct, getProductById} = require("../controllers/products.controllers");

//Get All Products
productsRouter.get("/", getAllProducts);

//Get Product by ID
productsRouter.get("/:pid", getProductById);

//Get Product by category
productsRouter.get("/category/:category", getProductsByCategory);

//Get Product by search
productsRouter.get("/search/product", getProductsBySearch);

//Create Product
productsRouter.post("/",createProduct);

//Delete Product
productsRouter.delete("/delete/:id", deleteProduct);

//Update Product
productsRouter.put("/put/:id", updateProduct);

module.exports = productsRouter;