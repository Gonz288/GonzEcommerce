const express = require("express");
const testRouter = express.Router();
const CustomError = require("../services/errors/customError");
const EErrors = require("../services/errors/enums");
const generateUserErrorInfo = require("../services/errors/info");

testRouter.get("/" , (req,res) =>{
    res.send({status:"success"});
});

testRouter.post("/", (req,res) =>{
    const {firstname, lastname, age, email} = req.body;

    if (!firstname || !lastname || !age || !email) {
        throw CustomError.createError({
        name: "UserError",
        cause: generateUserErrorInfo({firstname,lastname,age,email}),
        message: "Error trying to create a user",
        code: EErrors.INVALID_TYPES_ERROR,
        });
    }
});
module.exports = testRouter;