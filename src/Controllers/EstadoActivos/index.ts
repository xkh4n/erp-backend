/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('EstadoActivos Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { IEstadosActivos } from '../../Interfaces';

/* MODELS */
import EstadoActivos from "../../Models/estadoActivosModel";

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsId, IsName, IsParagraph } from '../../Library/Validations';

const setEstadoActivo = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promises = [];
        if(total === 0){
            throw createConflictError('No se envió ningún dato');
        }
        for (let i = 0; i < total; i++) {
            const estadoActivo: IEstadosActivos = req.body[i];
            if(!estadoActivo.nombre || typeof estadoActivo.nombre !== 'string' || estadoActivo.nombre.trim() === '' || IsName(estadoActivo.nombre) === false){
                throw createConflictError('El nombre del estado activo no es válido', estadoActivo.nombre);
            }
            if(!estadoActivo.descripcion || typeof estadoActivo.descripcion !== 'string' || estadoActivo.descripcion.trim() === '' || IsParagraph(estadoActivo.descripcion) === false){
                throw createConflictError('La descripción del estado activo no es válida', estadoActivo.descripcion);
            }

            const existingEstado = await EstadoActivos.findOne({nombre: estadoActivo.nombre});
            if(existingEstado){
                throw createConflictError('El estado activo ya existe', estadoActivo.nombre);
            }

            const newEstado = new EstadoActivos({
                nombre: estadoActivo.nombre,
                descripcion: estadoActivo.descripcion
            });

            promises.push(newEstado.save()
                .then(() => {
                    logger.info(`Estado Activo: ${estadoActivo.nombre} guardado correctamente.`);
                    return newEstado;
                })
                .catch((error) => {
                    logger.error(`Error al guardar el Estado Activo: ${estadoActivo.nombre}`, error);
                    throw createServerError('Error al guardar el Estado Activo');
                })
            );
        }
        const estadosActivos = await Promise.all(promises);
        res.status(201).json({
            codigo: 201,
            data: estadosActivos
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
};

const getEstadoActivo = async (req: Request, res: Response) => {
    try {
        const estadosActivos = await EstadoActivos.find();
        if (estadosActivos.length === 0) {
            throw createNotFoundError('No se encontraron Estados Activos');
        }
        res.status(200).json({
            codigo: 200,
            data: estadosActivos
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
};

const getEstadoActivoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!id || typeof id !== 'string' || id.trim() === '' || IsId(id) === false) {
            throw createConflictError('ID de Estado Activo no válido');
        }
        const estadoActivo = await EstadoActivos.findById(id);
        if (!estadoActivo) {
            throw createNotFoundError('Estado Activo no encontrado');
        }
        res.status(200).json({
            codigo: 200,
            data: estadoActivo
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
    setEstadoActivo,
    getEstadoActivo,
    getEstadoActivoById
}