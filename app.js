const express = require("express");
const config = require("./src/config/config");
const productsRouter = require("./src/routes/productsRouter");
const cartsRouter = require("./src/routes/cartsRouter");
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const {Server} = require("socket.io");
const messagesRouter = require("./src/routes/messagesRouter");
const messagesModel = require("./src/dao/mongo/models/messagesModel");
const loginRouter = require("./src/routes/loginRouter");
const signupRouter = require("./src/routes/signupRouter");
const chatRouter = require("./src/routes/chatRouter");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const initializePassport = require("./src/config/pasport.config");
const passport = require("passport");
const sessionRouter = require("./src/routes/sessionsRouter");
const ticketRouter = require("./src/routes/ticketRouter");
const mockingRouter = require("./src/routes/mockingRouter");
const errorHandler = require("./src/middlewares/errors/index");
const {addLogger} = require("./src/config/utils");
const {logger} = require("./src/config/utils");
const testRouter = require("./src/routes/test");
const resetPasswordRouter = require("./src/routes/resetPassword");
const usersRouter = require("./src/routes/usersRouter");
const app = express();

const STRING_CONNECTION = `mongodb+srv://${config.DB_USER}:${config.DB_PASS}@codercluster.zrkv6ij.mongodb.net/${config.DB_NAME}?retryWrites=true&w=majority`;

const httpServer = app.listen(config.PORT, ()=>{logger.info(`Server running on port ${config.PORT}`)});

//Handlebars
app.engine("handlebars", handlebars.engine({defaultLayout: 'main',handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set("views", __dirname + "/src/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/src/public"));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
initializePassport();
app.use(
    session({
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

//Global Variables
app.use((req, res, next)=>{
    res.locals.user = req.session.user || null;
    next();
});

//Routes
app.get("/loggerTest", (req,res)=>{
    req.logger.debug("Prueba de debug");
    req.logger.info("Prueba de info");
    req.logger.warning("Prueba de warning");
    req.logger.fatal("Prueba de fatal");
    req.logger.error("Prueba de error");
    req.logger.http("Prueba de http");
    res.send({message: "Prueba de Logger"});
});
app.use("/mockingProducts", mockingRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.post("/socketMessage", (req, res) => {
    const { message } = req.body;
    socketServer.emit("message", message);
    res.send("ok");
});
app.use("/messages", messagesRouter);
app.use("/chat", chatRouter);
app.use("/login", loginRouter);
app.use("/ticket", ticketRouter);
app.use("/signup", signupRouter);
app.use("/recoverPassword", resetPasswordRouter);
app.get("/logout", (req,res) =>{
    req.session.destroy();
    res.redirect("/login");
});
app.use("/test", testRouter);
app.use("/api/users",usersRouter);
app.use(errorHandler);

//WebChat
const messages = [];
let users = [];
const socketServer = new Server(httpServer);

socketServer.on("connection", (socket) =>{
    //Chat y Mensajes
    socket.on("newUser", (data) =>{
        socket.user = data.user; 
        socket.id = socket.id;
        users.push(data);
        socketServer.emit("usersLogs", users);
        socketServer.emit("newUserConnected", {
            user: data.user,
            id: socket.id,
            users,
        });
    });
    socket.on("disconnect", () =>{
        const userFilter = users.filter((elem) => elem.id !== socket.id);
        users = [].concat(userFilter);
        socketServer.emit("usersLogs", users);
        socketServer.emit("userDisconnected", {
            user: socket.user,
            id: socket.id,
        });
    });
    socket.on("message", (data) =>{
        messages.push(data);
        socketServer.emit("messageLogs", messages);
        messagesModel.create(data);
    });
});