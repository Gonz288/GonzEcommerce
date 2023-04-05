class ProductsRepository{
    constructor(dao){
        this.dao = dao;
    }

    get = async (filterPage, options) =>{
        let result = await this.dao.get(filterPage,options);
        return result;
    }

    create = async (product) =>{
        let result = await this.dao.create(product);
        return result;
    }
    
    delete = async (product) =>{
        let result = await this.dao.delete(product);
        return result;
    }

    update = async (product) =>{
        let result = await this.dao.update(product);
        return result;
    }

}

module.exports = {ProductsRepository};