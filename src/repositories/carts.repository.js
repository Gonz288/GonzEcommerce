class CartsRepository{
    constructor(dao){
        this.dao = dao;
    }

    getCarts = async () =>{
        let result = await this.dao.get();
        return result;
    }

    getOne = async (cid) =>{
        let result = await this.dao.getOne(cid);
        return result;
    }

    createCart = async () =>{
        let result = await this.dao.create();
        return result;
    }

    deleteAllProducts = async (cartId) =>{
        let result = await this.dao.deleteAllProducts(cartId);
        return result;
    }

    deleteProduct = async (cartId, productId) =>{
        let result = await this.dao.deleteProduct(cartId,productId);
        return result;
    }

    addProduct = async (cid, product) =>{
        let result = await this.dao.addProduct(cid,product);
        return result;
    }

    replaceProducts = async(cartId, productsArray) =>{
        let result = await this.dao.updateAll(cartId,productsArray);
        return result;
    }

    updateProduct = async (cartId, productObject) =>{
        let result = await this.dao.updateProduct(cartId,productObject);
        return result;
    }

    finalizePurchase = async (cid,user) =>{
        let result = await this.dao.finalizePurchase(cid,user);
        return result;
    }
}

module.exports = {CartsRepository};