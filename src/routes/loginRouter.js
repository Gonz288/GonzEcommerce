const express = require("express");
const routerLogin = express.Router();
const usersModel = require("../data/models/usersModel");

routerLogin.get("/", (req, res) =>{
    res.render("login", {title: "Login"});
});

routerLogin.post("/", async (req,res) =>{
    const {email , password} = req.body;
    if (!email || !password) {
        res.status(400).redirect("/login");
        return;
    }
    try{
        const response = await usersModel.findOne({email: email, passord: password});
        if(response){
            req.session.user = response;
            res.status(200).redirect("/api/products");
        }else{
            res.status(404).redirect("/login");
        }
    }catch(error){
        res.status(500).redirect("/login");
    }
});

module.exports = routerLogin;