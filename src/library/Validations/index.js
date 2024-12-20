/* ENVIRONMENT */
const dotenv = require("dotenv").config();

/* LOGS */
const log4 = require("log4js");
const logger = log4.getLogger("File IndexJWT.js");
logger.level = "all";

const Strings = (string) => {
  if (typeof string !== 'string' || !/^[a-zA-Z\s]*$/.test(string)) {
    logger.error("The input is not a valid string");
    return false;
  }
  return true;
}

const NumberInt = (number) => {
  if (typeof number !== 'number' || !/^[0-9]*$/.test(number)) {
    logger.error("The input is not a valid number");
    return false;
  }
  return true;
}

const Emails = (email) => {
  if (typeof email !== 'string' || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
    logger.error("The input is not a valid email");
    return false;
  }
  return true;
}

const Paragraphs = (string) => {
  if (typeof string !== 'string' || !/^[\w\s.,;:!?'"()\-]*$/.test(string)) {
    logger.error("The input is not a valid paragraph");
    return false;
  }
  return true;
}

const Phones = (phone) => {
  if (typeof phone !== 'string' || !/^(\+?\d{1,3})?\s?\d{1,2}\s?\d{4,5}\s?\d{4}$/.test(phone)) {
    logger.error("The input is not a valid phone number");
    return false;
  }
  return true;
}

const Decimals = (number) => {
  if (typeof number !== 'number' || !/^\d+\.\d+$/.test(number)) {
    logger.error("The input is not a valid decimal number");
    return false;
  }
  return true;
}

module.exports = {
    Strings,
    NumberInt,
    Emails,
    Paragraphs,
    Phones,
    Decimals,
};