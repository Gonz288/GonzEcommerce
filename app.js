const express = require("express");
const config = require("./src/config/config");
const productsRouter = require("./src/routes/productsRouter");
const cartsRouter = require("./src/routes/cartsRouter");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const loginRouter = require("./src/routes/loginRouter");
const signupRouter = require("./src/routes/signupRouter");
const flash = require("connect-flash");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const initializePassport = require("./src/config/pasport.config");
const passport = require("passport");
const sessionRouter = require("./src/routes/sessionsRouter");
const ticketRouter = require("./src/routes/ticketRouter");
const errorHandler = require("./src/middlewares/errors/index");
const {addLogger} = require("./src/config/utils");
const {logger} = require("./src/config/utils");
const testRouter = require("./src/routes/test");
const resetPasswordRouter = require("./src/routes/resetPassword");
const usersRouter = require("./src/routes/usersRouter");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUiExpress = require("swagger-ui-express");
const cors = require("cors");
const paymentRouter = require("./src/routes/paymentRouter");
const app = express();
const STRING_CONNECTION = `mongodb+srv://${config.DB_USER}:${config.DB_PASS}@codercluster.zrkv6ij.mongodb.net/${config.DB_NAME}?retryWrites=true&w=majority`;


const httpServer = app.listen(config.PORT, ()=>{logger.info(`Server running on port ${config.PORT}`)});

//Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: "Documenting with swagger",
            description: "Documenting carts and products",
        },
    },
    apis: [`${__dirname}/src/docs/**/*.yaml`],
};
const specs = swaggerJsdoc(swaggerOptions);

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
initializePassport();
app.use(flash());
app.use(
    session({
        key: "coderCookie",
        secret: "coderhouse",
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: STRING_CONNECTION,
            mongoOptions: {
                useUnifiedTopology: true,
            },
            ttl: 3600,
        }),
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/sessions", sessionRouter);
app.use(addLogger);
app.use(cors());

//Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    partialsDir: __dirname + '/src/views/partials',
    handlebars: allowInsecurePrototypeAccess(handlebars)
});
hbs.handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/src/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/src/public"));


//Global Variables
app.use((req, res, next)=>{
    app.locals.success = req.flash("success");
    app.locals.error = req.flash("error");
    res.locals.user = req.session.user || null;
    next();
});

//Routes
app.get("/loggerTest", (req,res)=>{
    req.logger.debug("Debug test");
    req.logger.info("Info test");
    req.logger.warning("Warning test");
    req.logger.fatal("Fatal test");
    req.logger.error("Error test");
    req.logger.http("Http test");
    res.send({message: "Logger test"});
});
app.use("/payments", paymentRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/login", loginRouter);
app.use("/ticket", ticketRouter);
app.use("/signup", signupRouter);
app.use("/recoverPassword", resetPasswordRouter);
app.use("/test", testRouter);
app.use("/api/users",usersRouter);
app.use(errorHandler);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));