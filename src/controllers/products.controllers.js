const {Products} = require("../dao/factory");
const {ProductsRepository} = require("../repositories/products.repository");
const productsService = new ProductsRepository(new Products());
const multer = require('multer');
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, `./src/public/img/products/`);
    },
    filename: function(req,file,cb){
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
    }
});
const upload = multer({storage: storage});

const getAllProducts = async (req, res) => {
    const limit = req.query.limit || 8;
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
};

const getProductsByCategory = async (req, res) => {
    const limit = req.query.limit || 5;
    let optionsUrl = `?limit=${limit}`;
    let page = parseInt(req.query.page) || 1;
    if(req.query.sort){
        if(!optionsUrl.includes("sort")){
            optionsUrl = optionsUrl + `&sort=${req.query.sort}`;
        }
    }

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
        res.status(200).render("productsByCategory", {object: object, category: category});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getProductsBySearch = async (req, res) => {
    const search = req.query.search;
    try {
        let object = await productsService.getByQuery(search);
        if(req.query.sort){
            req.query.sort === 'asc' ? 
                object = object.sort((a,b) => a.price - b.price) 
            : 
                object = object.sort((a,b) => b.price - a.price);
        } 
        let notFound;
        object.length === 0 ? notFound = true : notFound = false;
        res.status(200).render("productsBySearch", {object:object, notFound, search: search});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const createProduct = async (req, res) =>{
    if(req.session.user.admin | req.session.user.premium){
        upload.single('thumbnail')(req,res,async (err) =>{
            const {
                title,
                description,
                code,
                price,
                stock,
                category,
                status,
            } = req.body;
    
            const response = await productsService.getByCode(code);
            if (!title || !description || !code || !price || !stock || !category || !status || response.length >= 1) {
                fs.unlink(`./src/public/img/products/${req.file.filename}`, (err) => {
                    if (err) {
                        console.error('Error al eliminar la imagen:', err);
                    } else {
                        console.log('Imagen eliminada correctamente');
                    }
                });
                res.status(400).redirect("/api/products");
                return;
            }else{
                try {
                    let urlThumbnail = `/img/products/${req.file.filename}`;
                    req.session.user.premium ? owner = req.session.user.email : owner = "admin";
                    const myProduct = {title,description,code,price,thumbnail:urlThumbnail,stock,category,status,owner:"admin"};
                    const response = await productsService.create(myProduct);
                    res.status(200).redirect("/api/products");
                } catch (error) {
                    res.status(500).redirect("/api/products");
                }
            }
        });
    }else{
        res.status(401).send("No tienes Acceso.")
    }
};

const deleteProduct = async (req,res) =>{
    if(req.session.user.admin){
        const { id } = req.params;
        try {
            const result = await productsService.delete(id);
            console.log(result);
            fs.unlink(`./src/public/${result.thumbnail}`, (err) => {
                if (err) {
                    console.error('Error al eliminar la imagen:', err);
                } else {
                    console.log('Imagen eliminada correctamente');
                }
            });
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
                fs.unlink(`./src/public/${result.thumbnail}`, (err) => {
                    if (err) {
                        console.error('Error al eliminar la imagen:', err);
                    } else {
                        console.log('Imagen eliminada correctamente');
                    }
                });
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
        upload.single('thumbnail')(req,res,async (err) =>{
            const { id } = req.params;
            const {
                title,
                description,
                code,
                price,
                stock,
                category,
                status,
            } = req.body;

            const response = await productsService.getByCode(code);
            let responseId = response.length > 0 ? response[0]._id.toString() : id;

            if (!title || !description || !code || !price || !stock || !category || responseId !== id) {
                res.status(400).redirect("/api/products"); 
            }else{
                try{
                    let thumbnail;
                    if(req.file){
                        thumbnail = `/img/products/${req.file.filename}`;          
                        fs.unlink(`./src/public/${response[0].thumbnail}`, (err) => {
                            if (err) {
                                console.error('Error al eliminar la imagen:', err);
                            } else {
                                console.log('Imagen eliminada correctamente');
                            }
                        });
                    }
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
                    res.status(500).redirect("/api/products");
                }catch(error){
                    res.status(500).redirect("/api/products");
                }
            }
        });
    }else{
        res.status(401).send("No tienes Acceso");
    }
};

module.exports = {getAllProducts, getProductsByCategory, getProductsBySearch, createProduct, deleteProduct, updateProduct};