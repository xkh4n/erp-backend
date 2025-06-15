/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Ciudad Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { ICiudad } from '../../Interfaces';

/* MODELS */
import Paises  from "../../Models/paisesModel";
import Ciudades from "../../Models/ciudadesModel";

/* DEPENDENCIES */
import { Request, Response } from "express";

/* VALIDATIONS */
import {  IsIata, IsName, IsId } from '../../Library/Validations';

const setCity = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promises = [];
        if(total === 0){
            throw createConflictError('No se envió ningún dato');
        }
        for (let i = 0; i < total; i++) {
            const city: ICiudad = req.body[i];
            if(!IsName(city.name_city)){
                throw createConflictError('El nombre de la ciudad no es válido', city.name_city);
            }
            if(!IsIata(city.iata_codes)){
                throw createConflictError('El código IATA no es válido',city.iata_codes );
            }
            if(!IsIata(city.country)){
                throw createConflictError('El código ISO no es válido', city.country);
            }
            const pais = await Paises.findOne({iata_code: city.country});
            if(!pais){
                throw createNotFoundError('El país no existe');
            }
            const newCity = await Ciudades.findOne({iata_codes: city.iata_codes});
            if(newCity){
                throw createConflictError('La ciudad ya existe', city.name_city);
            }
            const ciudad = new Ciudades({
                iata_codes:city.iata_codes,
                name_city:city.name_city,
                country:pais._id
            });
            
            promises.push(ciudad.save()
                .then(() => {
                    logger.info(`País: ${city.name_city} guardado correctamente.`);
                    return ciudad;
                })
            );
        }
        const ciudades = await Promise.all(promises);
        res.status(201).json({
            codigo: 201,
            data: ciudades
        });
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getAllCities = async (req: Request, res: Response) => {
    try {
        const paises = await Ciudades.find({}).populate('country');
        if(paises.length === 0){
            throw createNotFoundError('No se encontraron ciudades', []);
        }
        res.status(200).json({
            codigo: 200,
            data: paises
        }); 
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const cityById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if(!IsId(id)){
            throw createConflictError('El ID no es válido', id);
        } 
        const findCity = await Ciudades.findById({_id: id});
        if(!findCity){
            throw createNotFoundError('La ciudad no existe', id);
        }
        res.status(200).json({
            codigo: 200,
            data: findCity
        });
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const cityByCountry = async (req: Request, res: Response) => {
    try {
        const { country } = req.body;
        if(!IsIata(country)){
            throw createConflictError('El código ISO no es válido', country);
        }
        const fndCountry = await Paises.findOne({iata_code: country});
        if(!fndCountry){
            throw createNotFoundError('El país no existe', country);
        }
        const findCity = await Ciudades.find({country: fndCountry._id});
        if(findCity.length === 0){
            throw createNotFoundError('El País no tiene ciudades Registradas', country);
        }
        res.status(200).json({
            codigo: 200,
            data: findCity 
        })
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const updateCity = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const updateData: ICiudad = req.body;
        const newCity = [];

        if(!IsId(id)){
            throw createConflictError('El ID no es válido', id);
        }
        logger.info(`Actualizando ciudad ID: ${id}`);

        if(updateData.name_city && !IsName(updateData.name_city)){
            throw createConflictError('El nombre de la ciudad no es válido', updateData.name_city);
        }

        if(updateData.iata_codes && !IsIata(updateData.iata_codes)){
            throw createConflictError('El código IATA no es válido', updateData.iata_codes);
        }
        const actualCountry = await Paises.findById(updateData.country);

        const existingCity = await Ciudades.findById(id);
        if(!existingCity){
            throw createNotFoundError('La ciudad no existe', id);
        }

        if(!actualCountry){
            throw createNotFoundError('El país no existe', existingCity.country);
        }
        if(!actualCountry._id.equals(existingCity.country)){
            newCity.push({"country":actualCountry._id});
        }
        const cityUpdate = {
            name_city: updateData.name_city || existingCity.name_city,
            iata_codes: updateData.iata_codes || existingCity.iata_codes,
            country: updateData.country || actualCountry._id
        };

        if(updateData.iata_codes){
            const duplicateCity = await Ciudades.findOne({
                _id: { $ne: id },
                iata_codes: updateData.iata_codes
            });
            if(duplicateCity){
                throw createConflictError('El código IATA ya existe', updateData.iata_codes);
            }
        }
        const updatedCity = await Ciudades.findByIdAndUpdate(
            id,
            cityUpdate,
            { new: true, runValidators: true }
        ).populate('country');

        logger.info(`Ciudad ID: ${id} actualizada correctamente.`);
        res.status(200).json({
            codigo: 200,
            data: updatedCity
        });

    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const deleteCity = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        
        if(!IsId(id)){
            throw createConflictError('El ID no es válido', id);
        }

        const city = await Ciudades.findById(id);
        if(!city){
            throw createNotFoundError('La ciudad no existe', id);
        }

        await Ciudades.findByIdAndDelete(id);
        
        logger.info(`Ciudad ID: ${id} eliminada correctamente.`);
        res.status(200).json({
            codigo: 200,
            message: 'Ciudad eliminada correctamente'
        });

    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export{
    setCity,
    getAllCities,
    cityById,
    cityByCountry,
    deleteCity,
    updateCity
}