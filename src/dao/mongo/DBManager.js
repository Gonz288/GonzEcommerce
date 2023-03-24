const productModel = require("./models/productsModel");
const cartModel = require("./models/cartsModel");

class CartManager {
    async read() {
        try {
            const carts = await cartModel.find().populate("products.product");
            return carts;
        }catch (err) {
            throw err;
        }
    }
    async readById(cartId){
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
    async delete(cartId) {
        try {
            const result = await cartModel.findByIdAndDelete(cartId);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async update(cartId, productId) {
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
    async deleteAllProductsFromCart(cartId){
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
    async deleteProductFromCart(cartId, productId){
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
}

class ProductManager {
    async read() {
        try{
            const products = await productModel.find();
        return products;
        }catch(err){
            throw err;
        }
    }

    async create(product) {
        try {
            const newProduct = new productModel(product);
            await newProduct.save();
            return newProduct;
        } catch (err) {
            throw err;
        }
    }

    async delete(productId) {
        try {
            const result = await productModel.findByIdAndDelete(productId);
            return result;
        }catch(err){
            throw err;
        }
    }
    
    async update(productId, product) {
        try {
            const result = await productModel.findByIdAndUpdate(productId, product);
            return result;
        }catch(err){
            throw err;
        }
    }
}

module.exports = {ProductManager, CartManager};