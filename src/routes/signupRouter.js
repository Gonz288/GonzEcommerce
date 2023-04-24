const express = require("express");
const routersignup = express.Router();
const usersModel = require("../dao/mongo/models/usersModel");
const passport = require("passport");

routersignup.get("/", (req, res) =>{
    res.render("signup", {title: "Register"});
});

routersignup.post("/", passport.authenticate("register", {failureRedirect: "/signup/failregister"}),async (req,res) =>{
    const {email, password, confirm_password, firstname, lastname, age} = req.body;
    let {admin} = req.body;
    if (!email || !firstname || !lastname || !age || !password || !confirm_password && password !== confirm_password) {
        res.redirect("/signup");
    }
    res.redirect("/login");
});

routersignup.get("/failregister", async(req,res)=>{
    res.send({error: "Failed"});
});

module.exports = routersignup;