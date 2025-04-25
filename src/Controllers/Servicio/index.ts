/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Servicio Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IServicio } from '../../Interfaces';

/* MODELS */
import Servicio from '../../Models/serviciosModel';
import Departamento from '../../Models/departamentoModel';


/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph } from '../../Library/Validations';

const setServicio = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IServicio>[] = [];
        for (let i = 0; i < total; i++) {
            const {codigo, nombre, descripcion, departamento} = req.body[i];
            if (!IsCodGerencia(codigo)) {
                throw createValidationError('El código debe tener 4 dígitos', codigo);
            }
            if (!IsName(nombre)) {
                throw createValidationError('El nombre debe tener entre 3 y 50 caracteres', nombre);
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción debe tener entre 3 y 100 caracteres', descripcion);
            }
            const fibdDepartamento = await Departamento.findOne({codigo: departamento});
            if (!fibdDepartamento) {
                throw createNotFoundError('No existe un departamento con ese código', departamento);
            }
            const newServicio = new Servicio({
                codigo,
                nombre,
                descripcion,
                departamento: fibdDepartamento._id
            })
            promise.push(newServicio.save()
                .then(
                    () => {
                        return newServicio;
                    }
                )
                .catch(
                    (error) => {
                        if (error.code === 11000) {
                            throw createConflictError('Ya existe un servicio con ese código', codigo);
                        }
                        throw createServerError('Sucedió un error Inesperado');
                    }
                )
            );
        }
        const service = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: service
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
    setServicio,
}