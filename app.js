const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const productsRouter = require("./src/routes/productsRouter");
const cartsRouter = require("./src/routes/cartsRouter");
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const {Server} = require("socket.io");
const messagesRouter = require("./src/routes/messagesRouter");
const messagesModel = require("./src/data/models/messagesModel");
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

dotenv.config();
const app = express();

const PORT = process.env.SERVER_PORT || 8081;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const STRING_CONNECTION = `mongodb+srv://${DB_USER}:${DB_PASS}@codercluster.zrkv6ij.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const httpServer = app.listen(PORT, ()=>{console.log(`Server running on port ${PORT}`)});

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
            ttl: 15,
        }),
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/sessions", sessionRouter);

//Global Variables
app.use((req, res, next)=>{
    res.locals.user = req.session.user || null;
    next();
});

//Routes
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
app.use("/signup", signupRouter);
app.get("/logout", (req,res) =>{
    req.session.destroy();
    res.redirect("/login");
});

//MongoDB
const environment = async () => {
    try {
        await mongoose.connect(STRING_CONNECTION);
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.log(`Error al conectar a MongoDB: ${error}`);
    }
};
const isValidStartData = () => {
    if (DB_PASS && DB_USER) return true;
    else return false;
};
isValidStartData() && environment();

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