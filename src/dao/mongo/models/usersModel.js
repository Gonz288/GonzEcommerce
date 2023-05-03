const mongoose = require("mongoose");
const usersCollection = "users";


const usersSchema = new mongoose.Schema({
    firstname: {type: String},
    lastname: {type: String},
    age: {type: Number},
    email: {type: String},
    premium: {type: Boolean, default: false},
    admin: {type: Boolean, default: false},
    cart: {type: String},
    password: {type: String}
}, {versionKey: false});

const usersModel = mongoose.model(usersCollection, usersSchema);

module.exports = usersModel;