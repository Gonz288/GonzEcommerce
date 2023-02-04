const express = require("express");
const { CartManager } = require("../data/classes/DBManager");
const cartsRouter = express.Router();
const cartManager = new CartManager();

cartsRouter.get("/", async (req, res) => {
    try {
        const cart = await cartManager.read();
        res.send(cart);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

cartsRouter.post("/", async (req, res) => {
    try {
        const response = await cartManager.create();
        res.status(200).send({ message: "Carrito creado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
});

cartsRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try{
        const response = await cartManager.delete(id);
        res.status(200).send({ message: "Carrito eliminado", response });
    }catch (err) {
    res.status(500).send(err.message);
    }
});

cartsRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    const product = req.body;
    try{
        const response = await cartManager.update(id, product);
        res.status(200).send({ message: "Carrito actualizado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = cartsRouter;