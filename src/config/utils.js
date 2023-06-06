const winston = require("winston");

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors:{
        fatal: 'bold red',
        error: 'red',
        warning: 'yellow',
        info: 'blue',
        http: 'cyan',
        debug: 'white',
    }
}
let logger;
if(process.env.NODE_ENV === "development"){
    logger = winston.createLogger({
        levels: customLevelsOptions.levels,
        transports:[
            new winston.transports.Console({
                level: "debug",
                format: winston.format.combine(
                    winston.format.colorize({ colors: customLevelsOptions.colors}),
                    winston.format.simple()
                )
            }),
        ]
    })
}else{
    logger = winston.createLogger({
        levels: customLevelsOptions.levels,
        transports:[
            new winston.transports.Console({
                level: "info",
                format: winston.format.combine(
                    winston.format.colorize({ colors: customLevelsOptions.colors}),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({
                filename: "./src/logs/errors.log",
                level: "error",
                format: winston.format.simple()
            })
        ]
    })
}

const addLogger = (req,res,next) =>{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString}`)
    next();
}

module.exports = {addLogger, logger};