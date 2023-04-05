const cartModel = require("./models/cartsModel");
const productModel = require("./models/productsModel");
const ticketModel = require("./models/ticketModel");
const Crypto = require("crypto");

class CartManager {
    async get() {
        try {
            const carts = await cartModel.find().populate("products.product");
            return carts;
        }catch (err) {
            throw err;
        }
    }
    async getOne(cartId){
        try {
            const cart = await cartModel.findById({_id: cartId}).populate("products.product");
            return cart;
        }catch (err) {
            throw err;
        }
    }
    async create() {
        try {
            const newCart = new cartModel();
            await newCart.save();
            return newCart;
        }catch (err) {
            throw err;
        }
    }
    async deleteCart(cartId) {
        try {
            const result = await cartModel.findByIdAndDelete(cartId);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async addProduct(cartId, productId) {
        const myProduct = {
            product: productId,
            quantity: 1,
        };
        try {
            const result = await cartModel.find({ _id: cartId });
        if (result[0].products.length === 0) {
            result[0].products.push(myProduct);
            const resultSave = await cartModel.findByIdAndUpdate(cartId, {products: result[0].products,});
            return resultSave;
        }else {
            const index = result[0].products.findIndex((element) => element.product.toString() === myProduct.product)
            
            index === -1 ? result[0].products.push(myProduct) : result[0].products[index].quantity += 1;

            const resultSave = await cartModel.findByIdAndUpdate(cartId, {products: result[0].products,});
            return resultSave;
        }
        }catch(err){
            throw err;
        }
    }
    async updateAll(cartId, productsArray){
        try {
            const result = await cartModel.find({ _id: cartId });
            if(result[0].products.length === 0){
                for (let i = 0; i < productsArray.length; i++) {
                    let myProduct = {
                        product: productsArray[i]._id,
                        quantity: productsArray[i].quantity
                    }
                    result[0].products.push(myProduct);
                }
                const resultSave = await cartModel.findByIdAndUpdate(cartId, {
                    products: result[0].products
                });
                return resultSave;
            }else{
                for(let i = 0; i < productsArray.length; i++){
                    let InCart = false;
                    for(let x = 0; x < result[0].products.length; x++){
                        if(productsArray[i]._id === result[0].products[x].product.toString()){
                            result[0].products[x].quantity = result[0].products[x].quantity + productsArray[i].quantity;
                            InCart = true;
                        }
                    }
                    if(!InCart){
                        let myProduct = {product: productsArray[i]._id, quantity: productsArray[i].quantity}
                        result[0].products.push(myProduct);
                    }
                }
                const resultSave = await cartModel.findByIdAndUpdate(cartId, {products: result[0].products});
                return resultSave;
            }
        } catch (err) {
            throw err;
        }
    }
    async updateProduct(cartId, productObject){
        const myProduct = {
            product: productObject._id,
            quantity: productObject.quantity,
        };
        try {
            const result = await cartModel.find({ _id: cartId });
            const index = result[0].products.findIndex((product) => product.product.toString() === myProduct.product);
            if (index !== -1) {
                result[0].products.splice(index,1,myProduct);
                const resultSave = await cartModel.findByIdAndUpdate(cartId, {products: result[0].products});
                return resultSave;
            }
        }catch (err) {
            throw err;
        }
    }
    async deleteAllProducts(cartId){
        try{
            const result = await cartModel.find({_id: cartId});
            result[0].products.length = 0;
            const resultSave = await cartModel.findByIdAndUpdate(cartId, {
                products: result[0].products,
            });
            return resultSave;
        }catch(err){
            throw err;
        }
    }
    async deleteProduct(cartId, productId){
        try{
            const result = await cartModel.find({_id: cartId});
            const index = result[0].products.findIndex((product) => product.product.toString() === productId);
            if(index !== -1){
                result[0].products.splice(index,1);
                const resultSave = await cartModel.findByIdAndUpdate(cartId, {
                    products: result[0].products,
                });
                return resultSave;
            }else{
                return "Product Not Found";
            }
        }catch(err){
            throw err;
        }
    }
    async finalizePurchase(cid,userEmail){
        try{
            const cart = await cartModel.findById({_id: cid}).populate("products.product");
            if(cart.products.length === 0){
                console.log("No hay productos en el carrito");
            }else{
                const productsPurchase = [];
                let totalPrice = 0;
                for(let i = 0; i < cart.products.length; i++){
                    if(cart.products[i].quantity > cart.products[i].product.stock){
                        console.log("No hay suficiente stock de ese producto");
                    }else{
                        let newStock = cart.products[i].product.stock - cart.products[i].quantity;
                        totalPrice = totalPrice + (cart.products[i].quantity * cart.products[i].product.price);
                        productsPurchase.push(cart.products[i]);
                        let saveProduct = await productModel.findByIdAndUpdate(cart.products[i].product._id, {stock: newStock});
                        cart.products.splice(i,1);
                        i--;
                    }
                }
                if(productsPurchase.length != 0){
                    let saveCart = await cartModel.findByIdAndUpdate(cid, {products: cart.products});
                    const myTicket = {
                        code: Crypto.randomBytes(16).toString("hex").substring(0, 6),
                        purchase_datetime: new Date(),
                        amount: totalPrice,
                        products: productsPurchase,
                        purchaser: userEmail
                    }
                    const ticket = await ticketModel.create(myTicket);
                    return ticket;
                }else{
                    return "No se pudo completar la compra.";
                }
            }
        }catch(error){
            throw error;
        }
    }
}

module.exports = {CartManager};