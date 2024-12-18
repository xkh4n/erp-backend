const controller = require("../../controllers/homeController");
const express = require("express");
const api = express.Router();

api.post("/",controller.getHome);

module.exports = api;