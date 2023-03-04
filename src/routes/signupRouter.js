const express = require("express");
const routersignup = express.Router();
const usersModel = require("../data/models/usersModel");
const passport = require("passport");

routersignup.get("/", (req, res) =>{
    res.render("signup", {title: "Register"});
});

routersignup.post("/", passport.authenticate("register", {failureRedirect: "/failregister"}),async (req,res) =>{
    const {email, password, confirm_password, firstname, lastname, age} = req.body;
    let {admin} = req.body;
    if(!email ||!password || !confirm_password ||!firstname ||!lastname ||!age || !admin && password !== confirm_password) {
        res.status(400).redirect("/signup");
        return;
    }else{
        res.status(200).redirect("/login");
    }
});

routersignup.get("/failregister", async(req,res)=>{
    res.send({error: "Failed"});
});

module.exports = routersignup;