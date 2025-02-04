const Controller = require("../../controllers/home");
const express = require("express");
const api = express.Router();

api.get("/",Controller.getHome);

module.exports = api;