/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Sub-Gerencia Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { ISubGerencia } from '../../Interfaces';

/* MODELS */
import SubGerencia from '../../Models/subgerenciaModel';
import Gerencia from '../../Models/gerenciaModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsBoolean, IsCodGerencia, IsName, IsParagraph } from '../../Library/Validations';


const setSubGerencia = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        let promise: Promise<ISubGerencia>[] = [];
        let state = false;
        for (let i = 0; i < total; i++) {
            const {codigo, nombre, descripcion, gerencia, estado} = req.body[i];
            if(!IsParagraph(nombre)){
                throw createValidationError('El nombre no es válido', nombre);
            }
            if(!IsCodGerencia(codigo)){
                throw createValidationError('El código no es válido', codigo);
            }
            if(!IsParagraph(descripcion)){
                throw createValidationError('La descripción no es válida', descripcion);
            }
            if(!IsBoolean(estado)){
                throw createValidationError('El estado no es válido', estado);
            }
            if (estado === 'true' || estado === '1'){
                state = true;
            }
            const fibdGerencia = await Gerencia.findOne({codigo: Number(gerencia)});
            if(!fibdGerencia){
                throw createNotFoundError('No existe una gerencia con ese código', gerencia);
            }
            const newSubGerencia = new SubGerencia({
                codigo,
                nombre,
                descripcion,
                estado: state,
                gerencia: fibdGerencia._id
            });
            promise.push(newSubGerencia.save()
                .then(
                    () => {
                        return newSubGerencia;
                    }
                ).catch(
                    (error) => {
                        if (error.code === 11000) {
                            throw createConflictError('Ya existe una sub-gerencia con ese código', codigo);
                        }
                        throw createServerError('Sucedió un error Inesperado');
                    }
                )
            );
        }
        const subgerencia = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: subgerencia
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

export{
    setSubGerencia
}