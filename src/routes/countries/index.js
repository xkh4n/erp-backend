const Controller = require("../../controllers/Countries");
const express = require("express");
const api = express.Router();

api.post("/", Controller.getCountry);

module.exports = api;