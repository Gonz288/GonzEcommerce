const mongoose = require("mongoose");
const usersCollection = "users";

const usersSchema = new mongoose.Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    age: {type: Number, required: true},
    email: {type: String, required: true},
    admin: {type: Boolean, required: true},
    password: {type: String, required: true}
}, {versionKey: false});

const usersModel = mongoose.model(usersCollection, usersSchema);

module.exports = usersModel;