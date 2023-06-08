const EErrors = require("../../services/errors/enums.js");
const {logger} = require("../../config/utils");
module.exports = (error, req, res, next) => {
    console.log(error);
    switch (error.code) {
        case EErrors.INVALID_TYPES_ERROR:
            res.send({status: "error", error: error.name});
        break;
        default:
            res.send({status: "error", error: "unhandled error"});
        break;
    }
};