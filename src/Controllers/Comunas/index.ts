/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Ciudad Controllers:');
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

export {
    setStates
}