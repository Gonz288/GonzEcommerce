const {Carts} = require("../dao/factory");
const {CartsRepository} = require("../repositories/carts.repository");
const cartsService = new CartsRepository(new Carts());

const {Products} = require("../dao/factory");
const {ProductsRepository} = require("../repositories/products.repository");
const productsService = new ProductsRepository(new Products());

const getAllCarts = async (req, res) =>{
    try {
        const cart = await cartsService.getCarts();
        res.status(200).send(cart);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getCartById = async (req, res) =>{
    if(req.session.user){
        const {cid} = req.params;
        try {
            let totalPrice = 0;
            const cart = await cartsService.getOne(cid);
            for(let i = 0; i < cart.products.length; i++){
                totalPrice = totalPrice + (cart.products[i].quantity * cart.products[i].product.price);
            }
    
            res.status(200).render("cartId", {cart:cart, totalPrice:totalPrice});
        } catch (err) {
            res.status(500).send(err.message);
        }
    }else{
        res.render("cartId", {});
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
        res.status(200).redirect(`/api/carts/${cid}`);
    }catch(err){
        res.status(500).send(err.message);
    }
}

const addProductsToCart = async (req,res) =>{
    const { cid } = req.params;
    const {productId, quantity} = req.body;
    const result = await productsService.getOne(productId);
    if(req.session.user.admin){
        res.status(401).send("No tienes Acceso");
    }else if(req.session.user.premium && result.owner === req.session.user.email){
        res.status(401).send("No puedes agregar tus productos al carrito");
    }else if(quantity > result.stock){
        res.send("No hay suficiente stock disponible de ese producto");
    }else{
        try{
            const response = await cartsService.addProduct(cid, productId, quantity);
            res.status(200).redirect("/api/products");
        }catch(error){
            throw error;
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
        res.redirect("/api/products");
    }catch(error){
        res.status(500).send(error.message);
    }
}
module.exports = {getAllCarts, getCartById, createCart, finalizePurchase, deleteAllProductsByCart, deleteProductByCart, replaceProductsToCart, updateProductByCart, addProductsToCart};