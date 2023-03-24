const { CartManager } = require("../dao/mongo/DBManager");
const cartManager = new CartManager();

const getAllCarts = async (req, res) =>{
    try {
        const cart = await cartManager.read();
        res.status(200).send(cart);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getCartById = async (req, res) =>{
    const {cid} = req.params;
    try {
        const cart = await cartManager.readById(cid);
        res.status(200).render("cartId", {cart});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const createCart = async (req, res) =>{
    try {
        const response = await cartManager.create();
        res.status(200).send({ message: "Carrito creado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteAllProductsByCart = async (req, res) =>{
    const { cid } = req.params;
    try{
        const response = await cartManager.deleteAllProductsFromCart(cid);
        res.status(200).send({ message: "Productos Eliminados", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteProductByCart = async (req, res) =>{
    const { cid } = req.params;
    const { pid } = req.params;
    try{
        const response = await cartManager.deleteProductFromCart(cid,pid);
        res.status(200).send({message: "Producto eliminado", response});
    }catch(err){
        res.status(500).send(err.message);
    }
}

const updateCart = async (req, res) =>{
    const { cid } = req.params;
    const products = req.body;
    try{
        const response = await cartManager.updateAll(cid, products);
        res.status(200).send({ message: "Carrito Actualizado con nuevos productos", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
}

const updateProductByCart = async (req,res) =>{
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
}

const addProductsCart = async (req,res) =>{
    const { cid } = req.params;
    const productObj = req.body;
    try{
        const response = await cartManager.update(cid, productObj.product);
        res.status(200).redirect("/api/products");
    }catch (err) {
        res.status(500).render("realTimeProducts",err.message);
    }
}

module.exports = {getAllCarts, getCartById, createCart, deleteAllProductsByCart, deleteProductByCart, updateCart, updateProductByCart, addProductsCart};