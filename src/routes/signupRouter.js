const express = require("express");
const routersignup = express.Router();
const usersModel = require("../data/models/usersModel");

routersignup.get("/", (req, res) =>{
    res.render("signup", {title: "Register"});
});

routersignup.post("/", async (req,res) =>{
    const {email, password, confirm_password, firstname, lastname, age} = req.body;
    let {admin} = req.body;
    if (!email ||!password || !confirm_password ||!firstname ||!lastname ||!age || !admin && password !== confirm_password) {
        res.status(400).redirect("/signup");
        return;
    }
    
    try {
        const response = await usersModel.create({email,password,firstname,lastname,age, admin});
        res.status(200).redirect("/login");
    } catch (err) {
        res.status(500).redirect("/signup");
    }
});

module.exports = routersignup;