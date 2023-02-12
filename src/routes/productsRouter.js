const express = require("express");
const { ProductManager } = require("../data/classes/DBManager.js");
const productsRouter = express.Router();
const productManager = new ProductManager();
const productsModel = require("../data/models/productsModel");

productsRouter.get("/", async (req, res) => {
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
      let productsPage = await productsModel.paginate( filterPage, options);
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
});

productsRouter.post("/", async (req, res) => {
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
    !category ||
    !status
    ) {
    res.status(400).redirect("/api/products");
    return;
  }

  try {
    const response = await productManager.create({
      title,
      description,
      code,
      price,
      thumbnail,
      stock,
      category,
      status,
    });
    const product = await productManager.read();
    res.status(200).redirect("/api/products");
  } catch (err) {
    res.status(500).redirect("/api/products");
  }
});

productsRouter.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await productManager.delete(id);
    res.status(200).redirect("/api/products");
  } catch (err) {
    res.status(500).redirect("/api/products");
  }
});

productsRouter.put("/put/:id", async (req, res) => {
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
    const result = await productManager.update(id, {
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
});

module.exports = productsRouter;