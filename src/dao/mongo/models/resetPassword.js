const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiration:{
        type: Date,
        required: true,
        expires: '60m',
        default: Date.now()
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    }
});

const ResetPassword = mongoose.model("resetpassword", resetPasswordSchema);

module.exports = ResetPassword;