/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Pais Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createAuthorizationError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { IPaises } from '../../Interfaces';

/* MODELS */
import Paises  from "../../Models/paisesModel";

/* DEPENDENCIES */
import { Request, Response } from "express";

/* VALIDATIONS */
import {  IsIata, IsId, IsISO, IsName } from '../../Library/Validations';

const setPaises = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createNotFoundError('No se encontraron datos');
        }
        const promises = [];
        for (let i = 0; i < total; i++) {
            const paises: IPaises = req.body[i];
            const {iso_code, name_country, iata_code} = paises;
            if(!IsIata(iata_code)){
                throw createAuthorizationError('El código IATA no es válido');
            }
            if(!IsISO(iso_code)){
                throw createAuthorizationError('El código ISO no es válido');
            }
            if(!IsName(name_country)){
                throw createAuthorizationError('El nombre no es válido');
            }
            const existingCountry = await Paises.findOne({
                $or: [{ iso_code }, { iata_code }]
            });
            if(existingCountry) {
                throw createConflictError("País ya existe", { 
                    iso_code, 
                    iata_code,
                    existing_id: existingCountry._id 
                });
            }

            const country = new Paises({
                iso_code,
                iata_code,
                name_country
            });
            
            promises.push(country.save()
                .then(() => {
                    logger.info(`País: ${name_country} guardado correctamente.`);
                    return country;
                })
            );
        }
        const countries = await Promise.all(promises);
        res.status(201).json({
            codigo: 201,
            data: countries
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

const getAllCountries = async (req: Request, res: Response) => {
    try {
        const paises = await Paises.find();
        if(paises.length === 0){
            throw createNotFoundError('No se encontraron datos');
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

const getPaisByIso = async (req: Request, res: Response) => {
    try {
        const { iso_code } = req.body;
        if(!IsISO(iso_code)){
            throw createNotFoundError('Debe proporsionar un código ISO válido');
        }
        const pais = await Paises.findOne({ iso_code });
        if(!pais){
            throw createNotFoundError('No se encontraron datos');
        }
        res.status(200).json({
            codigo: 200,
            data: pais
        }); 
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getCountryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        if(!IsId(id)){
            throw createNotFoundError('Debe proporsionar un ID valido');
        }
        const pais = await Paises.findById(id);
        if(!pais){
            throw createNotFoundError('No se encontraron datos');
        }
        res.status(200).json({
            codigo: 200,
            data: pais
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

const getPaisByIata = async (req: Request, res: Response) => {
    try {
        const { iata_code } = req.body;
        if(!IsIata(iata_code)){
            throw createNotFoundError('Debe proporsionar un código IATA válido');
        }
        const pais = await Paises.findOne({ iata_code });
        if(!pais){
            throw createNotFoundError('No se encontraron datos');
        }
        res.status(200).json({
            codigo: 200,
            data: pais
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
}


const updateCountry = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const updateData: IPaises = req.body;
        
        if(!IsId(id)){
            throw createNotFoundError('Debe proporcionar un ID válido');
        }

        if(updateData.iata_code && !IsIata(updateData.iata_code)){
            throw createAuthorizationError('El código IATA no es válido');
        }
        if(updateData.iso_code && !IsISO(updateData.iso_code)){
            throw createAuthorizationError('El código ISO no es válido');
        }
        if(updateData.name_country && !IsName(updateData.name_country)){
            throw createAuthorizationError('El nombre no es válido');
        }

        const existingCountry = await Paises.findById(id);
        if(!existingCountry){
            throw createNotFoundError('País no encontrado');
        }

        if(updateData.iso_code || updateData.iata_code) {
            const duplicateCountry = await Paises.findOne({
                _id: { $ne: id },
                $or: [
                    { iso_code: updateData.iso_code || existingCountry.iso_code },
                    { iata_code: updateData.iata_code || existingCountry.iata_code }
                ]
            });
            if(duplicateCountry) {
                throw createConflictError("Código ISO o IATA ya existe en otro país");
            }
        }

        const updatedCountry = await Paises.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        logger.info(`País ID: ${id} actualizado correctamente.`);
        res.status(200).json({
            codigo: 200,
            data: updatedCountry
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

const updateCountryByIso = async (req: Request, res: Response) => {
    try {
        const { iso_code } = req.body;
        const updateData: IPaises = req.body;

        if(!IsISO(iso_code)){
            throw createNotFoundError('Debe proporsionar un código ISO válido');
        }

        if(updateData.iata_code && !IsIata(updateData.iata_code)){
            throw createAuthorizationError('El código IATA no es válido');
        }
        if(updateData.name_country && !IsName(updateData.name_country)){
            throw createAuthorizationError('El nombre no es válido');
        }

        const existingCountry = await Paises.findOne({ iso_code });
        if(!existingCountry){
            throw createNotFoundError('País no encontrado');
        }

        if(updateData.iso_code || updateData.iata_code) {
            const duplicateCountry = await Paises.findOne({
                _id: { $ne: existingCountry._id },
                $or: [
                    { iso_code: updateData.iso_code || existingCountry.iso_code },
                    { iata_code: updateData.iata_code || existingCountry.iata_code }
                ]
            });
            if(duplicateCountry) {
                throw createConflictError("Código ISO o IATA ya existe en otro país");
            }
        }

        const updatedCountry = await Paises.findOneAndUpdate(
            { iso_code },
            updateData,
            { new: true, runValidators: true }
        );

        logger.info(`País ISO: ${iso_code} actualizado correctamente.`);
        res.status(200).json({
            codigo: 200,
            data: updatedCountry
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

const updateCountryByIata = async (req: Request, res: Response) => {
    try {
        const { iata_code } = req.body;
        const updateData: IPaises = req.body;

        if(!IsIata(iata_code)){
            throw createNotFoundError('Debe proporsionar un código IATA válido');
        }

        if(updateData.iso_code && !IsISO(updateData.iso_code)){
            throw createAuthorizationError('El código ISO no es válido');
        }
        if(updateData.name_country && !IsName(updateData.name_country)){
            throw createAuthorizationError('El nombre no es válido');
        }

        const existingCountry = await Paises.findOne({ iata_code });
        if(!existingCountry){
            throw createNotFoundError('País no encontrado');
        }

        if(updateData.iso_code || updateData.iata_code) {
            const duplicateCountry = await Paises.findOne({
                _id: { $ne: existingCountry._id },
                $or: [
                    { iso_code: updateData.iso_code || existingCountry.iso_code },
                    { iata_code: updateData.iata_code || existingCountry.iata_code }
                ]
            });
            if(duplicateCountry) {
                throw createConflictError("Código ISO o IATA ya existe en otro país");
            }
        }

        const updatedCountry = await Paises.findOneAndUpdate(
            { iata_code },
            updateData,
            { new: true, runValidators: true }
        );

        logger.info(`País IATA: ${iata_code} actualizado correctamente.`);
        res.status(200).json({
            codigo: 200,
            data: updatedCountry
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

const deleteCountry = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        
        if(!IsId(id)){
            throw createNotFoundError('Debe proporcionar un ID válido');
        }

        const country = await Paises.findById(id);
        if(!country){
            throw createNotFoundError('País no encontrado');
        }

        await Paises.findByIdAndDelete(id);
        
        logger.info(`País ID: ${id} eliminado correctamente.`);
        res.status(200).json({
            codigo: 200,
            message: 'País eliminado correctamente'
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


export {
    setPaises,
    getAllCountries,
    getCountryById,
    getPaisByIso,
    getPaisByIata,
    updateCountry,
    updateCountryByIso,
    updateCountryByIata,
    deleteCountry
}