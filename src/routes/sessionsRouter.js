const express = require("express");
const sessionRouter = express.Router();
const passport = require("passport");
const usersModel = require("../data/models/usersModel");

sessionRouter.get("/github", passport.authenticate("github", {scope: ["user: email"]}), async(req,res)=>{});
sessionRouter.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/login"}), async(req,res)=>{
    req.session.user = req.user;
    res.redirect("/api/products");
});

module.exports = sessionRouter;