const express = require("express");
const { ProductManager } = require("../data/classes/DBManager.js");
const productsRouter = express.Router();
const productManager = new ProductManager();

productsRouter.get("/", async (req, res) => {
    try {
      const product = await productManager.read();
      res.status(200).render("realTimeProducts", {products: product} );
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
    res.status(400).render("realTimeProducts",{ error: "Faltan datos" });
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
    res.status(200).render("realTimeProducts",{ message: "Producto creado", response, products: product});
  } catch (err) {
    res.status(500).render("realTimeProducts",err.message);
  }
});

productsRouter.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await productManager.delete(id);
    res.status(200).redirect("/api/products");
  } catch (err) {
    res.status(500).redirect("/api/products");
  }
});

productsRouter.post("/put/:id", async (req, res) => {
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