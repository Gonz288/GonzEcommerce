const express = require("express");
const sessionRouter = express.Router();
const passport = require("passport");

sessionRouter.get("/github", passport.authenticate("github", {scope: ["user: email"]}), async(req,res)=>{});
sessionRouter.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/login"}), async(req,res)=>{
    req.session.user = req.user;
    res.redirect("/api/products");
});
sessionRouter.get("/current", async(req,res)=>{
    res.send(req.session);
});

module.exports = sessionRouter;