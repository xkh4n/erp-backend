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
import {  IsIata, IsName, IsId, IsPostal, IsTerritorial, IsSii } from '../../Library/Validations';

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

export {
    setStates,
    getAllComunas,
    getComunaByCity,
}