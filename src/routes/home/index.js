const Controller = require("../../controllers/home");
const express = require("express");
const api = express.Router();

api.post("/",Controller.getHome);

module.exports = api;