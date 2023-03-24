const mongoose = require("mongoose");

const messageCollection = "messages";

const messageSchema = new mongoose.Schema({
    user: String,
    id: String,
    message: String,
});
const messageModel = mongoose.model(messageCollection, messageSchema);

module.exports = messageModel;