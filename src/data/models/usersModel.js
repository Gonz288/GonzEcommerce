const mongoose = require("mongoose");
const usersCollection = "users";


const usersSchema = new mongoose.Schema({
    firstname: {type: String},
    lastname: {type: String},
    age: {type: Number},
    email: {type: String},
    admin: {type: Boolean},
    password: {type: String}
}, {versionKey: false});

const usersModel = mongoose.model(usersCollection, usersSchema);

module.exports = usersModel;