/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Tipos Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { ICategoria } from '../../Interfaces';

/* MODELS */

import Tipo from '../../Models/categoriasModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodTipo, IsName, IsParagraph, IsBoolean, IsId, IsUsername } from '../../Library/Validations';

const setTipo = async (req: Request, res: Response) : Promise<void> => {
    const total = Object.keys(req.body).length;
    if (total === 0) {
        throw createValidationError('No se enviaron datos', []);
    }
    const promise: Promise<ICategoria>[] = [];
    try {
        for(let x = 0; x < total; x++) {
            const { codigo, nombre, descripcion, tipo, estado } = req.body[x];
            // VALIDATIONS
            if (!codigo || !nombre || !descripcion || !tipo || estado === undefined) {
                throw createValidationError('Los Campos no pueden venir vacíos', '');
            }
            if (!IsCodTipo(codigo)) {
                throw createValidationError('El código del tipo debe tener 5 caracteres', 'Código: ' + codigo );
            }
            if (!IsParagraph(nombre)) {
                throw createValidationError('El nombre del producto debe tener entre 3 y 50 caracteres', 'Nombre: ' + nombre );
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción del producto debe tener entre 10 y 200 caracteres', 'Descripción: ' + descripcion );
            }
            if (!IsBoolean(estado)) {
                throw createValidationError('El estado debe ser verdadero o falso', 'Estado: ' + estado );
            }
            if(!IsUsername(tipo)) {
                throw createValidationError('El tipo debe ser un nombre válido', 'Tipo: ' + tipo);
            }
            // Check if the type already exists
            const existingTipo = await Tipo.findOne({ codigo });
            if (existingTipo) {
                throw createConflictError('El código del tipo ya existe', 'Código: ' + codigo);
            }
            // Create a new Tipo instance and save it to the database
            const newTipo = new Tipo({ codigo, nombre, descripcion, tipo, estado });
            try {
                await newTipo.save();
                promise.push(Promise.resolve(newTipo));
            }  catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Categoría con ese nombre', nombre);
                }
                throw createServerError('Sucedió un error Inesperado al guardar la Categoría', nombre);
            }
        }
        const categoria = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: categoria
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getTipos = async (req: Request, res: Response) : Promise<void> => {
    try {
        const tipos = await Tipo.find();
        // Devolver array vacío si no hay tipos, no un error
        res.status(200).json({
            codigo: 200,
            data: tipos || [], // Asegurar que siempre sea un array
            message: tipos.length === 0 ? 'No hay categorías disponibles' : 'Categorías obtenidas exitosamente'
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
};

const getTipoById = async (req: Request, res: Response) : Promise<void> => {
    const { id } = req.body;

    try {
        if (!IsId(id)) {
            throw createValidationError('El ID debe ser un identificador válido', 'ID: ' + id);
        }
        const tipo = await Tipo.findById(id);
        if (!tipo) {
            throw createNotFoundError('Tipo no encontrado', 'ID: ' + id);
        }
        res.status(200).json({
            codigo: 200,
            data: tipo
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
};

const getLastTipo = async (req: Request, res: Response) : Promise<void> => {
    try {
        // Ordenar por código en orden descendente para obtener el código más alto
        const lastTipo = await Tipo.findOne().sort({ codigo: -1 }).limit(1);
        if (!lastTipo) {
            throw createNotFoundError('No se encontraron tipos', 'Tipos');
        }
        res.status(200).json({
            codigo: 200,
            data: lastTipo
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    setTipo,
    getTipos,
    getTipoById,
    getLastTipo,
}