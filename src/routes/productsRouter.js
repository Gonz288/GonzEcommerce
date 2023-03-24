const express = require("express");
const productsRouter = express.Router();

const {getAllProducts, createProduct, deleleteProduct, updateProduct} = require("../controllers/products.controllers");

productsRouter.get("/", getAllProducts);

productsRouter.post("/", createProduct);

productsRouter.delete("/delete/:id", deleleteProduct);

productsRouter.put("/put/:id", updateProduct);

module.exports = productsRouter;