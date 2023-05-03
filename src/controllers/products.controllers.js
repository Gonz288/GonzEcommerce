const {Products} = require("../dao/factory");
const {ProductsRepository} = require("../repositories/products.repository");
const productsService = new ProductsRepository(new Products());

const getAllProducts = async (req, res) => {
    if(req.session.user){
        const limit = req.query.limit || 5;
        let optionsUrl = `?limit=${limit}`;
        let page = parseInt(req.query.page) || 1;
        if(req.query.sort){
        if(!optionsUrl.includes("sort")){
            optionsUrl = optionsUrl + `&sort=${req.query.sort}`;
        }
        }

        let filterPage;
        if(req.query.category){
            filterPage = {category: req.query.category}
            if(!optionsUrl.includes("category")){
                optionsUrl = optionsUrl + `&category=${req.query.category}`
            }
        }else if(req.query.status){
            filterPage = {status: req.query.status}
            if(!optionsUrl.includes("status")){
                optionsUrl = optionsUrl + `&status=${req.query.status}`
            }
        }else{
            filterPage = {}
        }

        const options = {page: page, limit: limit, sort: req.query.sort ? {price: req.query.sort} : {}};
        try {
            let productsPage = await productsService.get(filterPage, options)
            const object = {
            status: "success",
            payload: productsPage.docs,
            totalPages: productsPage.totalPages,
            prevPage: productsPage.prevPage,
            nextPage: productsPage.nextPage,
            hasPrevPage: productsPage.hasPrevPage,
            hasNextPage: productsPage.hasNextPage,
            prevLink: productsPage.hasPrevPage != false ? `${optionsUrl}&page=${page - 1}` : null,
            nextLink: productsPage.hasNextPage != false ? `${optionsUrl}&page=${page + 1}` : null,
        }
        res.status(200).render("realTimeProducts", {object});
        } catch (err) {
        res.status(500).send(err.message);
        }
    }else{
        res.status(404).redirect("/login");
    }
};

const getProductsByCategory = async (req, res) => {
    if(req.session.user){
        const limit = req.query.limit || 5;
        let optionsUrl = `?limit=${limit}`;
        let page = parseInt(req.query.page) || 1;
        if(req.query.sort){
        if(!optionsUrl.includes("sort")){
            optionsUrl = optionsUrl + `&sort=${req.query.sort}`;
        }
        }

        /*let filterPage;
        if(req.query.category){
            filterPage = {category: req.query.category}
            if(!optionsUrl.includes("category")){
                optionsUrl = optionsUrl + `&category=${req.query.category}`
            }
        }else if(req.query.status){
            filterPage = {status: req.query.status}
            if(!optionsUrl.includes("status")){
                optionsUrl = optionsUrl + `&status=${req.query.status}`
            }
        }else{
            filterPage = {}
        }*/

        const options = {page: page, limit: limit, sort: req.query.sort ? {price: req.query.sort} : {}};

        const {category} = req.params;
        let filterPage = {category: category};

        try {
            let productsPage = await productsService.get(filterPage, options)
            const object = {
                status: "success",
                payload: productsPage.docs,
                totalPages: productsPage.totalPages,
                prevPage: productsPage.prevPage,
                nextPage: productsPage.nextPage,
                hasPrevPage: productsPage.hasPrevPage,
                hasNextPage: productsPage.hasNextPage,
                prevLink: productsPage.hasPrevPage != false ? `${optionsUrl}&page=${page - 1}` : null,
                nextLink: productsPage.hasNextPage != false ? `${optionsUrl}&page=${page + 1}` : null,
            }
            res.status(200).render("productsByCategory", {object});
        } catch (err) {
            res.status(500).send(err.message);
        }
    }else{
        res.status(404).redirect("/login");
    }
};

const createProduct = async (req, res) =>{
        if(req.session.user.admin | req.session.user.premium){
            const {
                title,
                description,
                code,
                price,
                thumbnail,
                stock,
                category,
                status,
            } = req.body;
            let urlThumbnail = `/img/${category}/${thumbnail}`;
            if (
                !title ||
                !description ||
                !code ||
                !price ||
                !thumbnail ||
                !stock ||
                !category ||
                !status
                ) {
                res.status(400).redirect("/api/products");
                return;
            }
            
            try {
                let owner;
                req.session.user.premium ? owner = req.session.user.email : owner = "admin";
                const myProduct = {title,description,code,price,thumbnail:urlThumbnail,stock,category,status,owner};
                const response = await productsService.create(myProduct);
                res.status(200).redirect("/api/products");
            } catch (err) {
                res.status(500).redirect("/api/products");
            }
        }else{
            res.status(401).send("No tienes Acceso.")
        }
};

const deleteProduct = async (req,res) =>{
    if(req.session.user.admin){
        const { id } = req.params;
        try {
            const result = await productsService.delete(id);
            res.status(200).redirect("/api/products");
        } catch (err) {
            res.status(500).redirect("/api/products");
        }
    }else if(req.session.user.premium){
        const { id } = req.params;
        try{
            const product = await productsService.getOne(id);
            if(product.owner === req.session.user.email){
                const result = await productsService.delete(id);
                res.status(200).redirect("/api/products");
            }else{
                res.status(401).send("No tienes Acceso");
            }
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso");
    }
};

const updateProduct = async (req,res) =>{
    if(req.session.user.admin){
        const { id } = req.params;
        const {
            title,
            description,
            code,
            price,
            thumbnail,
            stock,
            category,
            status,
        } = req.body;
        if (
            !title ||
            !description ||
            !code ||
            !price ||
            !thumbnail ||
            !stock ||
            !category
        ) {
            res.status(400).redirect("/api/products");
            return;
        }
        try {
            const result = await productsService.update(id, {
                title,
                description,
                code,
                price,
                thumbnail,
                stock,
                category,
                status,
            });
            res.status(200).redirect("/api/products");
        } catch (err) {
            res.status(500).redirect("/api/products");
        }
    }else{
        res.status(401).send("No tienes Acceso");
    }
};

module.exports = {getAllProducts, getProductsByCategory, createProduct, deleteProduct, updateProduct};