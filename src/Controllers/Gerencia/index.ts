/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Gerencia Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IGerencia } from '../../Interfaces';

/* MODELS */
import Gerencia from '../../Models/gerenciaModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph } from '../../Library/Validations';

const setGerencia = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createValidationError('No se enviaron datos', []);
        }
        const promise = [];
        for (const key in req.body) {
            const { codigo, nombre, descripcion } = req.body[key];
            if(IsName(nombre)){
                throw createValidationError('El nombre no es válido', nombre);
            }
            if(IsCodGerencia(codigo)){
                throw createValidationError('El código no es válido', codigo);
            }
            if(IsParagraph(descripcion)){
                throw createValidationError('La descripción no es válida', descripcion);
            }

            const newGerencia = new Gerencia({
                codigo,
                nombre,
                descripcion
            });
            promise.push((newGerencia.save()
                .then(() => {
                    logger.info(`Gerencia: ${nombre} guardada correctamente.`);
                    return newGerencia;
                }).catch((err) =>  {
                    if (err.code === 11000) {
                        throw createConflictError('Ya existe una gerencia con ese código', codigo);
                    }
                    throw createServerError('Sucedió un error Inesperado al guardar la gerencia', nombre);
                }))
            );
        }
        const gerencia = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: gerencia
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

export {
    setGerencia
}