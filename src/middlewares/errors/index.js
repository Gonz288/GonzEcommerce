const EErrors = require("../../services/errors/enums");
const {logger} = require("../../config/utils");
const errorHandler = (error, req,res,next) => {
    logger.error(error.cause);
    switch(error.code){
        case EErrors.INVALID_TYPES_ERROR:
            res.send({status:"error", error:error.name});
            break;
        default:
            res.send({status:"error", error:"Unhandled error"});
    };
};

module.exports = errorHandler;