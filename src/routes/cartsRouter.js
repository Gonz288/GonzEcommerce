const express = require("express");
const {getAllCarts, getCartById, createCart, deleteAllProductsByCart, finalizePurchase , deleteProductByCart, addProductsToCart, updateProductByCart, replaceProductsToCart} = require("../controllers/carts.controllers");
const cartsRouter = express.Router();

//Obtener todos los carritos
cartsRouter.get("/", getAllCarts);

//Obtener carrito por ID
cartsRouter.get("/:cid", getCartById);

//Crear Carrito
cartsRouter.post("/", createCart);

//Eliminar todos los productos del carrito
cartsRouter.delete("/:cid", deleteAllProductsByCart);

//Eliminar Producto del Carrito
cartsRouter.delete("/:cid/products/:pid", deleteProductByCart);

//Actualizar carrito con nuevos productos
cartsRouter.put("/:cid", replaceProductsToCart);

//Actualizar carrito agregando/sacando cantidad del mismo producto
cartsRouter.put("/:cid/products/:pid", updateProductByCart);

//Agregar Producto/s al Carrito
cartsRouter.post("/:cid", addProductsToCart);

//Finalizar la compra
cartsRouter.get("/:cid/purchase", finalizePurchase);

module.exports = cartsRouter;