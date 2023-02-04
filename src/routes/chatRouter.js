const express = require("express");
const chatRouter = express.Router();

chatRouter.get("/" , (req,res) =>{
    res.render("chat",{title: "Chat"});
});

module.exports = chatRouter;