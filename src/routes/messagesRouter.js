const express = require("express");
const messagesRouter = express.Router();
const messagesModel = require("../dao/mongo/models/messagesModel");

messagesRouter.get("/", async (req, res) => {
    try {
        let users = await messagesModel.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

messagesRouter.get("/", (req, res) => {
    let messages = [];
    res.json(messages);
});

module.exports = messagesRouter; 