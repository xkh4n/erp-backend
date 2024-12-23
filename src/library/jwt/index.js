/* ENVIRONMENT */
const dotenv = require("dotenv").config();

/* LOGS */
const log4 = require("log4js");
const logger = log4.getLogger("File IndexJWT.js");
logger.level = "all";

/* VALIDATIONS */
const validations = require("../Validations");

/* LIBRARYS */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* CUSTOM ERRORS */
const Errors = require("../Errors");

const createAccessToken = (user) => {
    const expToken = new Date();
    expToken.setHours(expToken.getHours() + 5);
    const payload = {
        token_type: "access",
        user: user._id,
        expired: expToken.getTime()
    }
    return jwt.sign(payload, process.env.JWT_KEY);
}

const createRefreshToken = (user) => {
    const expToken = new Date();
    expToken.getMonth(expToken.getMonth() + 1);
    const payload = {
        token_type: "refresh",
        user: user._id,
        expired: expToken.getTime()
    }
    return jwt.sign(payload, process.env.JWT_KEY);
}

const decoded = (token) => {
    return jwt.decode(token, process.env.JWT_KEY, true);
}
module.exports = {
    createAccessToken,
    createRefreshToken,
    decoded,
}