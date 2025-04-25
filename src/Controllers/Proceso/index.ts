/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Proceso Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IProceso } from '../../Interfaces';

/* MODELS */
import Proceso from '../../Models/procesoModel';
import Servicio from '../../Models/serviciosModel';


/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph, IsProceso } from '../../Library/Validations';

const setProceso = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IProceso>[] = [];
        if (total === 0) {
            throw createValidationError('No se envió ningún dato', req.body);
        }
        for (let i=0; i<total; i++) {
            const { codigo, nombre, descripcion, estado, servicio } = req.body[i];
            if (!IsProceso(codigo)) {
                throw createValidationError('El código debe ser un número entero', codigo);
            }
            if (!IsName(nombre)) {
                throw createValidationError('El nombre debe ser una cadena de texto', nombre);
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción debe ser una cadena de texto', descripcion);
            }
            if (typeof estado !== 'boolean') {
                throw createValidationError('El estado debe ser un booleano', estado);
            }
            if (!IsCodGerencia(servicio)) {
                throw createValidationError('El servicio debe ser un número entero', servicio);
            }
            const fibdServicio = await Servicio.findOne({ codigo: servicio });
            if (!fibdServicio) {
                throw createNotFoundError('No existe un servicio con ese código', servicio);
            }
            const newProceso = new Proceso({
                codigo,
                nombre,
                descripcion,
                estado,
                servicio: fibdServicio._id
            })
            promise.push(newProceso.save()
                .then(
                    () => {
                        return newProceso;
                    }
                )
                .catch(
                    (error) => {
                        if (error.code === 11000) {
                            throw createConflictError('Ya existe un proceso con ese código', codigo);
                        }
                        throw createServerError('Sucedió un error Inesperado');
                    }
                )
            );
        }
        const proceso = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: proceso
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
    setProceso,
}