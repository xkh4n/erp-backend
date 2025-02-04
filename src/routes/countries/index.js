const Controller = require("../../controllers/Countries");
const express = require("express");
const api = express.Router();

api.post("/", Controller.getCountry);
api.post("/guardar", Controller.setCountries);
api.post("/byid", Controller.getCountryById);
api.post("/byiso", Controller.getCountryByIso);

module.exports = api;