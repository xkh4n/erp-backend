/* ENVIRONMENT */
const dotenv = require("dotenv").config();

/* LOGS */
const log4 = require("log4js");
const logger = log4.getLogger("File Server.js");
logger.level = "all";

/* SERVER */
const express = require("express");

/* APP */
const app = express();


/* BODY PARSER */
const parser = require("body-parser");

/* CORS */
const cors = require("cors");

/* CONFIGURE PARSER */
app.use(parser.urlencoded({extended:false}));
app.use(parser.json());

/* CONFIGURE CORS */
app.use(cors());


/* ROUTES */
const {home, countries} = require("./src/routes");
const base_path = '/api/' + process.env.API_VER;

/* ROUTES CONFIGURE */
app.use(base_path, home);
app.use(base_path + "/countries", countries);

/* STATICS FOLDERS */
app.use(express.static("uploads"));
app.use(express.static("uploads/avatars"));
app.use(express.static("uploads/files"));


module.exports = app;