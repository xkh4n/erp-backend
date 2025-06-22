/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('EstadoActivos Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { ISubEstadosActivos } from '../../Interfaces';

/* MODELS */
import SubEstadosActivos from '../../Models/subEstadosActivosModel';
import EstadoActivos from '../../Models/estadoActivosModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsId, IsName, IsParagraph } from '../../Library/Validations';

const setSubEstadoActivo = async (req: Request, res: Response) => {
    try {
        const total = Object.keys(req.body).length;
        const promises = [];
        if (total === 0) {
            throw createConflictError('No se envió ningún dato');
        }
        for (let i = 0; i < total; i++) {
            const subEstadoActivo: ISubEstadosActivos = req.body[i];
            if (!subEstadoActivo.nombre || typeof subEstadoActivo.nombre !== 'string' || subEstadoActivo.nombre.trim() === '' || IsName(subEstadoActivo.nombre) === false) {
                throw createConflictError('El nombre del sub estado activo no es válido', subEstadoActivo.nombre);
            }
            if (!subEstadoActivo.descripcion || typeof subEstadoActivo.descripcion !== 'string' || subEstadoActivo.descripcion.trim() === '' || IsParagraph(subEstadoActivo.descripcion) === false) {
                throw createConflictError('La descripción del sub estado activo no es válida', subEstadoActivo.descripcion);
            }
            if (
                !subEstadoActivo.estadoActivo ||
                !IsId(
                    typeof subEstadoActivo.estadoActivo === 'string'
                        ? subEstadoActivo.estadoActivo
                        : subEstadoActivo.estadoActivo.toString()
                )
            ) {
                throw createConflictError('El ID del estado activo no es válido', subEstadoActivo.estadoActivo);
            }

            const existingSubEstado = await SubEstadosActivos.findOne({ nombre: subEstadoActivo.nombre });
            if (existingSubEstado) {
                throw createConflictError('El sub estado activo ya existe', subEstadoActivo.nombre);
            }

            const estadoActivo = await EstadoActivos.findById(subEstadoActivo.estadoActivo);
            if (!estadoActivo) {
                throw createNotFoundError('El estado activo asociado no existe', subEstadoActivo.estadoActivo);
            }

            const newSubEstado = new SubEstadosActivos({
                nombre: subEstadoActivo.nombre,
                descripcion: subEstadoActivo.descripcion,
                estadoActivo: estadoActivo._id
            });

            promises.push(newSubEstado.save()
                .then(() => {
                    logger.info(`Sub Estado Activo: ${subEstadoActivo.nombre} guardado correctamente.`);
                    return newSubEstado;
                })
                .catch((error) => {
                    logger.error(`Error al guardar el Sub Estado Activo: ${subEstadoActivo.nombre}`, error);
                    throw createServerError('Error al guardar el Sub Estado Activo');
                })
            );
        }
        const subEstadosActivos = await Promise.all(promises);
        res.status(201).json({
            codigo: 201,
            data: subEstadosActivos
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

const getSubEstadosActivos = async (req: Request, res: Response) => {
    try {
        const subEstadosActivos = await SubEstadosActivos.find().populate('estadoActivo');
        if (subEstadosActivos.length === 0) {
            throw createNotFoundError('No se encontraron Sub Estados Activos');
        }
        res.status(200).json({
            codigo: 200,
            data: subEstadosActivos
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

const getSubEstadoActivoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!IsId(id)) {
            throw createConflictError('El ID del sub estado activo no es válido', id);
        }
        const subEstadoActivo = await SubEstadosActivos.findById(id).populate('estadoActivo');
        if (!subEstadoActivo) {
            throw createNotFoundError('Sub Estado Activo no encontrado', id);
        }
        res.status(200).json({
            codigo: 200,
            data: subEstadoActivo
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

const deleteSubEstadoActivo = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!IsId(id)) {
            throw createConflictError('El ID del sub estado activo no es válido', id);
        }
        const subEstadoActivo = await SubEstadosActivos.findByIdAndDelete(id);
        if (!subEstadoActivo) {
            throw createNotFoundError('Sub Estado Activo no encontrado', id);
        }
        res.status(200).json({
            codigo: 200,
            data: subEstadoActivo
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

const getSubEstadoByEstadoActivo = async (req: Request, res: Response) => {
    try {
        const { estadoActivoId } = req.body;
        if (!IsId(estadoActivoId)) {
            throw createConflictError('El ID del estado activo no es válido', estadoActivoId);
        }
        const subEstadosActivos = await SubEstadosActivos.find({ estadoActivo: estadoActivoId }).populate('estadoActivo');
        if (subEstadosActivos.length === 0) {
            throw createNotFoundError('No se encontraron Sub Estados Activos para el Estado Activo', estadoActivoId);
        }
        res.status(200).json({
            codigo: 200,
            data: subEstadosActivos
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

export {
    setSubEstadoActivo,
    getSubEstadosActivos,
    getSubEstadoActivoById,
    deleteSubEstadoActivo,
    getSubEstadoByEstadoActivo
};
