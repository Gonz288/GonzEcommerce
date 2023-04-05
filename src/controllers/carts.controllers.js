const {Carts} = require("../dao/factory");
const {CartsRepository} = require("../repositories/carts.repository");
const cartsService = new CartsRepository(new Carts());

const getAllCarts = async (req, res) =>{
    try {
        const cart = await cartsService.getCarts();
        res.status(200).send(cart);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getCartById = async (req, res) =>{
    const {cid} = req.params;
    try {
        const cart = await cartsService.getOne(cid);
        res.status(200).render("cartId", {cart});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const createCart = async (req, res) =>{
    try {
        const response = await cartsService.createCart();
        res.status(200).send({ message: "Carrito creado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteAllProductsByCart = async (req, res) =>{
    const { cid } = req.params;
    try{
        const response = await cartsService.deleteAllProducts(cid);
        res.status(200).send({ message: "Productos Eliminados", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteProductByCart = async (req, res) =>{
    const { cid } = req.params;
    const { pid } = req.params;
    try{
        const response = await cartsService.deleteProduct(cid,pid);
        res.status(200).send({message: "Producto eliminado", response});
    }catch(err){
        res.status(500).send(err.message);
    }
}

const addProductsToCart = async (req,res) =>{
    if(req.session.user.admin){
        res.status(401).send("No tienes Acceso");
    }else{
        const { cid } = req.params;
        const productObj = req.body;
        try{
            const response = await cartsService.addProduct(cid, productObj.product);
            res.status(200).redirect("/api/products");
        }catch (err) {
            res.status(500).render("realTimeProducts",err.message);
        }
    }
}

const replaceProductsToCart = async (req, res) =>{
    const { cid } = req.params;
    const products = req.body;
    try{
        const response = await cartsService.replaceProducts(cid, products);
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
        const response = await cartsService.updateProduct(cid,productObject);
        res.status(200).send({ message: "Producto Actualizado", response });
    }catch (err) {
        res.status(500).send(err.message);
    }
}

const finalizePurchase = async (req,res) =>{
    const { cid } = req.params;
    const user = req.session.user.email;
    try{
        const response = await cartsService.finalizePurchase(cid, user);
        res.status(200).send(response);
    }catch(error){
        res.status(500).send(error.message);
    }
}
module.exports = {getAllCarts, getCartById, createCart, finalizePurchase, deleteAllProductsByCart, deleteProductByCart, replaceProductsToCart, updateProductByCart, addProductsToCart};