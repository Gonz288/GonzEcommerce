const express = require("express");
const { CartManager } = require("../data/classes/DBManager");
const cartsRouter = express.Router();
const cartManager = new CartManager();

//Obtener todos los carritos
cartsRouter.get("/", async (req, res) => {
    try {
        const cart = await cartManager.read();
        console.log(JSON.stringify(cart,null,"\t"))
        res.status(200).send(cart);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Obtener carrito por ID
cartsRouter.get("/:cid", async (req, res) => {
    const {cid} = req.params;
    try {
        const cart = await cartManager.readById(cid);
        res.status(200).render("cartId", {cart});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Crear Carrito
cartsRouter.post("/", async (req, res) => {
    try {
        const response = await cartManager.create();
        res.status(200).send({ message: "Carrito creado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
});

//Eliminar todos los productos del carrito
cartsRouter.delete("/:cid", async (req, res) => {
    const { cid } = req.params;
    try{
        const response = await cartManager.deleteAllProductsFromCart(cid);
        res.status(200).send({ message: "Productos Eliminados", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
});

//Eliminar Producto del Carrito
cartsRouter.delete("/:cid/products/:pid", async (req, res) =>{
    const { cid } = req.params;
    const { pid } = req.params;
    try{
        const response = await cartManager.deleteProductFromCart(cid,pid);
        res.status(200).send({message: "Producto eliminado", response});
    }catch(err){
        res.status(500).send(err.message);
    }
})

//Actualizar carrito con nuevos productos
cartsRouter.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const products = req.body;
    try{
        const response = await cartManager.updateAll(cid, products);
        res.status(200).send({ message: "Carrito Actualizado con nuevos productos", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
});

//Actualizar carrito agregando/sacando cantidad del mismo producto
cartsRouter.put("/:cid/products/:pid", async (req, res) => {
    const { cid } = req.params;
    const { pid } = req.params;
    const quantityObj = req.body;
    const productObject = {
        _id: pid,
        quantity: quantityObj.quantity
    }
    
    try{
        const response = await cartManager.updateProduct(cid,productObject);
        res.status(200).send({ message: "Producto Actualizado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
});

//Agregar Producto/s al Carrito
cartsRouter.post("/:cid", async (req, res) => {
    const { cid } = req.params;
    const productObj = req.body;
    try{
        const response = await cartManager.update(cid, productObj.product);
        res.status(200).redirect("/api/products");
    }catch (err) {
        res.status(500).render("realTimeProducts",err.message);
    }
});

module.exports = cartsRouter;