const express = require("express");
const routerLogin = express.Router();
const passport = require("passport");
const usersModel = require("../dao/mongo/models/usersModel");

routerLogin.get("/", (req, res) =>{
    res.render("login", {title: "Login"});
});

routerLogin.post("/", passport.authenticate("login", {failureRedirect:"/login/failLogin"}),async (req,res) =>{
    if(!req.user) return res.status(400).send({status:"error", error:"invalid credentials"});
    req.session.user = {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        age: req.user.age,
        admin: req.user.admin,
        email: req.user.email,
        premium: req.user.premium
    }
    res.status(200).redirect("api/products");
});

routerLogin.get("/failLogin", async(req,res)=>{
    res.send({error: "Failed"});
});

module.exports = routerLogin;
