const express = require("express");
const {generateProducts} = require("../config/utils");
const mockingRouter = express.Router();
mockingRouter.get("/", async (req, res) => {
    let products = [];
    for(let i =0; i < 100; i++){
        products.push(generateProducts());
    }
    res.send({status:"success",payload: products});
});

module.exports = mockingRouter; 