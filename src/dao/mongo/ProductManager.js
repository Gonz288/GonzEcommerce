const productModel = require("./models/productsModel");

class ProductManager {
    async get(filterPage, options){
        try{
            const paginate = await productModel.paginate(filterPage, options);
            return paginate;
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

module.exports = {ProductManager};