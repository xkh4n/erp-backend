/* ENVIRONMENT */
const dotenv = require('dotenv').config();

/* LOGS */
const log4 = require("log4js");
const logger = log4.getLogger("File Home Controller");
logger.level = "all";

/* VALIDATIONS */
const Validates = require("../../library/Validations");


const getHome = async (req, res) => {
    try {
        res.status(200).send({msg:"Ok"});
    } catch (error) {
        res.status(400).send({msg:"Mal"});
    }
}

module.exports = {
    getHome,
}