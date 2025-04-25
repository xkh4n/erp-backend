/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Departamento Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IDepartamento } from '../../Interfaces';

/* MODELS */
import Departamento from '../../Models/departamentoModel';
import SubGerencia from '../../Models/subgerenciaModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph } from '../../Library/Validations';

const setDepartamento = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IDepartamento>[] = [];
        for (let i = 0; i < total; i++) {
            const { codigo, nombre, descripcion, subgerencia } = req.body[i];
            if (!IsCodGerencia(codigo)) {
                throw createValidationError('El código de la sub-gerencia debe tener 4 caracteres', codigo);
            }
            if (!IsName(nombre)) {
                throw createValidationError('El nombre de la sub-gerencia debe tener entre 3 y 50 caracteres', nombre);
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción de la sub-gerencia debe tener entre 3 y 200 caracteres', descripcion);
            }
            const fibdSubGerencia = await SubGerencia.findOne({ codigo:subgerencia });
            if(!fibdSubGerencia){
                throw createNotFoundError('No existe una sub-gerencia con ese código', subgerencia);
            }
            const newDepartamento = new Departamento({
                codigo,
                nombre,
                descripcion,
                subgerencia: fibdSubGerencia._id
            });
            promise.push(newDepartamento.save()
                .then(
                    () => {
                        return newDepartamento;
                    }
                )
                .catch(
                    (error) => {
                        if (error.code === 11000) {
                            throw createConflictError('Ya existe un departamento con ese código', codigo);
                        }
                        throw createServerError('Sucedió un error Inesperado');
                    }
                )
            );
        }
        const depto = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: depto
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
    setDepartamento
};