/* ENVIRONMENT */
const dotenv = require('dotenv').config();

/* LOGS */
const log4 = require("log4js");
const logger = log4.getLogger("File Home Controller");
logger.level = "all";

/* VALIDATIONS */
const Validates = require("../../library/Validations");

/* MODELS */
const Countries = require("../../models/Countries");

const getCountry = async (req, res) => {
    try {
        const country = await Countries.find();
        return country;
    } catch (error) {
        logger.error("Error en getCountry: ",error);
        return false;
    }
}

module.exports = {
    getCountry,
}