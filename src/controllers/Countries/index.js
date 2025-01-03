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

/* LIBRARYS */
const err = require("../../library/Errors");

const getCountry = async (req, res) => {
    try {
        const country = await Countries.find();
        if(!country){
            throw new err(401,"No existen datos que mostrar");
        }
        res.status(201).send(country);
    } catch (error) {
        if (error instanceof err) {
            res.status(error.code).send(error.getMessage());
        } else {
            const response = {
                "code": 500,
                "dataMessage": error.message
            }
            res.status(500).json(response);
        }
    }
}

const getCountryById = async (req, res) => {
    try {
        if(req.body[0].id == null){
            throw new err(501,"Campos no pueden estar Vacíos");
        }
        const promises = [];
        for (const countryData of req.body) {
            const { id } = countryData;
            const country = await Countries.findById({_id:id})
            if(!country){
                throw new err(401,"No existen datos que mostrar");
            }
            promises.push(country);
        }

        const pais = await Promise.all(promises);
        const response = {
            "code": 201,
            "dataMessage": pais
        }
        res.status(201).send(response);
    } catch (error) {
        if (error instanceof err) {
            res.status(error.code).send(error.getMessage());
        } else {
            const response = {
                "code": 500,
                "dataMessage": error.message
            }
            res.status(500).json(response);
        }
    }
}

const getCountryByIso = async (req, res) => {
    try {
        if(req.body[0].iso_code == null){
            throw new err(501,"Campos no pueden estar Vacíos");
        }
        const promises = [];
        for (const countryData of req.body) {
            const { iso_code } = countryData;
            const country = await Countries.findOne({iso_code:iso_code})
            if(!country){
                throw new err(401,"No existen datos que mostrar");
            }
            promises.push(country);
        }

        const pais = await Promise.all(promises);
        const response = {
            "code": 201,
            "dataMessage": pais
        }
        res.status(201).send(response);
    } catch (error) {
        if (error instanceof err) {
            res.status(error.code).send(error.getMessage());
        } else {
            const response = {
                "code": 500,
                "dataMessage": error.message
            }
            res.status(500).json(response);
        }
    }
}


const setCountries = async (req, res) => {
    try {
        const cant = Object.keys(req.body).length;
        if(req.body[0].iso_code == null){
            throw new err(501,"Campos no pueden estar Vacíos");
        }
        const promises = [];
        for (const countryData of req.body) {
            const { iso_code, iata_code, name_country } = countryData;
            const newCountry = new Countries({ iso_code, iata_code, name_country });
            const country = await newCountry.save();
            promises.push(country);
        }

        const pais = await Promise.all(promises);
        const response = {
            "code": 201,
            "dataMessage": pais
        }
        res.status(201).send(response);
    } catch (error) {
        if (error instanceof err) {
            res.status(error.code).send(error.getMessage());
        } else {
            const response = {
                "code": 500,
                "dataMessage": error.message
            }
            res.status(500).json(response);
        }
    }
}

module.exports = {
    getCountry,
    setCountries,
    getCountryById,
    getCountryByIso,
}