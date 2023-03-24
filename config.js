const dotenv = require("dotenv");

const environment = "DEVELOPMENT";

dotenv.config({
    path: environment === "DEVELOPMENT" ? "./.env.development" : "./.env.production",
});

const config = {
    PORT: process.env.PORT || 8080,
    DB_USER: process.env.DB_USER || null,
    DB_PASS: process.env.DB_PASS || null,
    DB_NAME: process.env.DB_NAME || null,
};

module.exports = config;