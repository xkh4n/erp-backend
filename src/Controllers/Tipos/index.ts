/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Tipos Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */

/* MODELS */
import Tipo from '../../Models/tiposModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodTipo, IsName, IsParagraph, IsBoolean, IsId } from '../../Library/Validations';

const setTipo = async (req: Request, res: Response) : Promise<void> => {
    const { codigo, nombre, descripcion, estado } = req.body;

    // VALIDATIONS
    if (!codigo || !nombre || !descripcion || estado === undefined) {
        logger.error("Missing required fields");
        throw createValidationError('Los Campos no pueden venir vacíos', '');
    }
    if (!IsCodTipo(codigo)) {
        throw createValidationError('El código del tipo debe tener 5 caracteres', 'Código: ' + codigo );
    }
    if (!IsName(nombre)) {
        throw createValidationError('El nombre del producto debe tener entre 3 y 50 caracteres', 'Nombre: ' + nombre );
    }
    if (!IsParagraph(descripcion)) {
        throw createValidationError('La descripción del producto debe tener entre 10 y 200 caracteres', 'Descripción: ' + descripcion );
    }
    if (!IsBoolean(estado)) {
        throw createValidationError('El estado debe ser verdadero o falso', 'Estado: ' + estado );
    }
    // Check if the type already exists
    const existingTipo = await Tipo.findOne({ codigo });
    if (existingTipo) {
        throw createConflictError('El código del tipo ya existe', 'Código: ' + codigo);
    }
    // Create a new Tipo instance and save it to the database
    try {
        const newTipo = new Tipo({ codigo, nombre, descripcion, estado });
        await newTipo.save();
        res.status(201).json({
            codigo: 201,
            data: newTipo
        });
    }  catch (err) {
        if (err.code === 11000) {
            throw createConflictError('Ya existe un Tipo con ese nombre', nombre);
        }
        throw createServerError('Sucedió un error Inesperado al guardar el Tipo', nombre);
    }
};

const getTipos = async (req: Request, res: Response) : Promise<void> => {
    try {
        const tipos = await Tipo.find();
        if (!tipos || tipos.length === 0) {
            throw createNotFoundError('No se encontraron tipos', 'Tipos');
        }
        res.status(200).json({
            codigo: 200,
            data: tipos
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

export {
    setTipo,
    getTipos,
    getTipoById,
}