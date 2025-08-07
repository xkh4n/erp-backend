/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Comunas Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IComuna } from '../../Interfaces';

/* MODELS */
import Ciudad from '../../Models/ciudadesModel';
import Comuna from '../../Models/comunasModel';

/* DEPENDENCIES */
import { Request, Response } from "express";

/* VALIDATIONS */
import {  IsIata, IsName, IsId, IsPostal, IsTerritorial, IsSii, IsNameDepto } from '../../Library/Validations';

const setStates = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promises = [];
        for(let i = 0; i < total; i++) {
            const { cod_territorial, cod_postal, name_comuna, ciudad, cod_sii } = req.body[i];
            if(!IsTerritorial(cod_territorial)) {
                throw createValidationError("Código territorial incorrecto", { field: "cod_territorial", value: cod_territorial });
            }
            if(!IsPostal(cod_postal)) {
                throw createValidationError("Código postal incorrecto", { field: "cod_postal", value: cod_postal });
            }
            if(!IsSii(cod_sii)) {
                throw createValidationError("Código SII incorrecto", { field: "cod_sii", value: cod_sii });
            }
            if(!IsName(name_comuna)) {
                throw createValidationError("Nombre de la comuna incorrecto", { field: "name_comuna", value: name_comuna });
            }
            if(!IsIata(ciudad)) {
                throw createValidationError("Ciudad incorrecta", { field: "ciudad", value: ciudad });
            }

            const city = await Ciudad.findOne({iata_codes: ciudad});
            if(!city) {
                throw createNotFoundError("Ciudad no encontrada", { iata_codes: ciudad });
            }

            const existingState = await Comuna.findOne({
                $or: [
                    { cod_territorial },
                    { name_comuna }
                ]
            });
            if(existingState) {
                throw createConflictError("Comuna ya existe", { 
                    cod_territorial,
                    name_comuna
                });
            }

            const comuna = new Comuna({
                cod_territorial,
                cod_postal,
                name_comuna,
                cod_sii,
                ciudad: city._id
            });
            
            promises.push(comuna.save()
                .then(() => {
                    logger.info(`Comuna o Estado: ${name_comuna} guardado correctamente.`);
                    return comuna;
                })
            );
        }
        const states = await Promise.all(promises);
        res.status(201).json({
            codigo: 201,
            data: states
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

const getAllComunas = async (req: Request, res: Response) => {
    try {
        const comunas = await Comuna.find({});
        if(comunas.length === 0){
            throw createNotFoundError('No se encontraron comunas', []);
        }
        res.status(200).json({
            codigo: 200,
            data: comunas
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

const getComunaByCity = async (req: Request, res: Response) => {
    try {
        const { ciudad } = req.body;
        if(!IsIata(ciudad)){
            throw createConflictError('El código ISO no es válido', ciudad);
        }
        logger.warn(ciudad);
        const fndCiudad = await Ciudad.findOne({iata_codes: ciudad});
        logger.info(fndCiudad);
        if(!fndCiudad){
            throw createNotFoundError('La Ciudad no existe', ciudad);
        }
        const findCity = await Comuna.find({ciudad: fndCiudad._id});
        if(findCity.length === 0){
            throw createNotFoundError('La Ciudad no tiene Comunas Registradas', ciudad);
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

const getComunaByTerritorial = async (req: Request, res: Response) => {
    try {
        const { cod_territorial } = req.body;
        if(!IsTerritorial(cod_territorial)){
            throw createConflictError('El código territorial no es válido', cod_territorial);
        }
        const findComuna = await Comuna.findOne({cod_territorial});
        if(!findComuna){
            throw createNotFoundError('La Comuna no existe', cod_territorial);
        }
        res.status(200).json({
            codigo: 200,
            data: findComuna 
        })
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

const getComunaBySii = async (req: Request, res: Response) => {
    try {
        const { cod_sii } = req.body;
        if(!IsSii(cod_sii)){
            throw createConflictError('El código SII no es válido', cod_sii);
        }
        const findComuna = await Comuna.findOne({cod_sii});
        if(!findComuna){
            throw createNotFoundError('La Comuna no existe', cod_sii);
        }
        res.status(200).json({
            codigo: 200,
            data: findComuna 
        })
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


const getComunaByPostal = async (req: Request, res: Response) => {
    try {
        const { cod_postal } = req.body;
        if(!IsPostal(cod_postal)){
            throw createConflictError('El código postal no es válido', cod_postal);
        }
        const findComuna = await Comuna.findOne({cod_postal});
        if(!findComuna){
            throw createNotFoundError('La Comuna no existe', cod_postal);
        }
        res.status(200).json({
            codigo: 200,
            data: findComuna 
        })
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

const getComunaByName = async (req: Request, res: Response) => {
    try {
        const { name_comuna } = req.body;
        if(!IsName(name_comuna)){
            throw createConflictError('El nombre de la comuna no es válido', name_comuna);
        }
        const findComuna = await Comuna.findOne({name_comuna});
        if(!findComuna){
            throw createNotFoundError('La Comuna no existe', name_comuna);
        }
        res.status(200).json({
            codigo: 200,
            data: findComuna 
        })
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

const updateByPostal = async (req: Request, res: Response) => {
    try {
        const { cod_postal, cod_territorial, cod_sii, name_comuna, ciudad } = req.body;
        if(!IsPostal(cod_postal)){
            throw createConflictError('El código postal no es válido', cod_postal);
        }
        if(!IsTerritorial(cod_territorial)){
            throw createConflictError('El código territorial no es válido', cod_territorial);
        }
        if(!IsSii(cod_sii)){
            throw createConflictError('El código SII no es válido', cod_sii);
        }
        if(!IsNameDepto(name_comuna)){
            throw createConflictError('El nombre de la comuna no es válido', name_comuna);
        }
        if(!IsId(ciudad)){
            throw createConflictError('El ID de la ciudad no es válido', ciudad);
        }
        const updatedComuna = await Comuna.findOneAndUpdate(
            { cod_postal },
            { cod_territorial, cod_sii, name_comuna, ciudad },
            { new: true, runValidators: true }
        );
        if (!updatedComuna) {
            throw createNotFoundError('Comuna no encontrada', cod_postal);
        }
        res.status(200).json({
            codigo: 200,
            data: updatedComuna
        });
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const updateByTerritorial = async (req: Request, res: Response) => {
    try {
        const { cod_territorial, cod_postal, cod_sii, name_comuna, ciudad } = req.body;
        if(!IsTerritorial(cod_territorial)){
            throw createConflictError('El código territorial no es válido', cod_territorial);
        }
        if(!IsPostal(cod_postal)){
            throw createConflictError('El código postal no es válido', cod_postal);
        }
        if(!IsSii(cod_sii)){
            throw createConflictError('El código SII no es válido', cod_sii);
        }
        if(!IsNameDepto(name_comuna)){
            throw createConflictError('El nombre de la comuna no es válido', name_comuna);
        }
        if(!IsId(ciudad)){
            throw createConflictError('El ID de la ciudad no es válido', ciudad);
        }
        const updatedComuna = await Comuna.findOneAndUpdate(
            { cod_territorial },
            { cod_postal, cod_sii, name_comuna, ciudad },
            { new: true, runValidators: true }
        );
        if (!updatedComuna) {
            throw createNotFoundError('Comuna no encontrada', cod_territorial);
        }
        res.status(200).json({
            codigo: 200,
            data: updatedComuna
        });
    } catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const updateById = async (req: Request, res: Response) => {
    try {
        const { id, cod_territorial, cod_postal, cod_sii, name_comuna, ciudad } = req.body;
        if(!IsId(id)){
            throw createConflictError('El ID de la comuna no es válido', id);
        }
        if(!IsTerritorial(cod_territorial)){
            throw createConflictError('El código territorial no es válido', cod_territorial);
        }
        if(!IsPostal(cod_postal)){
            throw createConflictError('El código postal no es válido', cod_postal);
        }
        if(!IsSii(cod_sii)){
            throw createConflictError('El código SII no es válido', cod_sii);
        }
        if(!IsNameDepto(name_comuna)){
            throw createConflictError('El nombre de la comuna no es válido', name_comuna);
        }
        if(!IsId(ciudad)){
            throw createConflictError('El ID de la ciudad no es válido', ciudad);
        }
        const updatedComuna = await Comuna.findByIdAndUpdate(
            id,
            { cod_territorial, cod_postal, cod_sii, name_comuna, ciudad },
            { new: true, runValidators: true }
        );
        if (!updatedComuna) {
            throw createNotFoundError('Comuna no encontrada', id);
        }
        res.status(200).json({
            codigo: 200,
            data: updatedComuna
        });
    }
    catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}


const updateByName = async (req: Request, res: Response) => {
    try {
        const { name_comuna, cod_territorial, cod_postal, cod_sii, ciudad } = req.body;
        if(!IsNameDepto(name_comuna)){
            throw createConflictError('El nombre de la comuna no es válido', name_comuna);
        }
        if(!IsTerritorial(cod_territorial)){
            throw createConflictError('El código territorial no es válido', cod_territorial);
        }
        if(!IsPostal(cod_postal)){
            throw createConflictError('El código postal no es válido', cod_postal);
        }
        if(!IsSii(cod_sii)){
            throw createConflictError('El código SII no es válido', cod_sii);
        }
        if(!IsId(ciudad)){
            throw createConflictError('El ID de la ciudad no es válido', ciudad);
        }
        const updatedComuna = await Comuna.findOneAndUpdate(
            { name_comuna },
            { cod_territorial, cod_postal, cod_sii, ciudad },
            { new: true, runValidators: true }
        );
        if (!updatedComuna) {
            throw createNotFoundError('Comuna no encontrada', name_comuna);
        }
        res.status(200).json({
            codigo: 200,
            data: updatedComuna
        });
    }
    catch (error) {
        logger.error(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}
export {
    setStates,
    getAllComunas,
    getComunaByCity,
    getComunaByTerritorial,
    getComunaBySii,
    getComunaByPostal,
    getComunaByName,
    updateByPostal,
    updateByTerritorial,
    updateById,
    updateByName
}