/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Dependencias Controller:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";


/* INTERFACES */
import { IDependencia} from '../../Interfaces';

/* MODELS */
import Dependencias from '../../Models/salasModel';


/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodTipo, IsName, IsParagraph, IsBoolean, IsId, IsUsername, IsNumero } from '../../Library/Validations';


const setNewDependencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { codigo, nombre } = req.body;
        logger.warn('Creando nueva dependencia con los datos:', { codigo, nombre });
        // Validate request data
        if (!codigo || !nombre) {
            throw createValidationError('Todos los campos son obligatorios', []);
        }
        if(!IsNumero(codigo) || !IsName(nombre)){
            throw createValidationError('El código debe ser numérico y el nombre debe ser texto', []);
        }
        // Check for existing dependencia by code or name
        const existingDependencia = await Dependencias.findOne({ $or: [ { codigo }, { nombre } ] });
        if (existingDependencia) {
            throw createConflictError('Ya existe una dependencia con el mismo código o nombre', []);
        }
        // Create new Dependencia instance
        const nuevaDependencia = new Dependencias({ codigo, nombre });
        await nuevaDependencia.save();
        res.status(201).json({ message: 'Dependencia creada exitosamente', dependencia: nuevaDependencia });
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

const getAllDependencias = async (req: Request, res: Response): Promise<void> => {
    try {
        const dependencias = await Dependencias.find().sort({ codigo: 1 });
        res.status(200).json(dependencias);
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

export { setNewDependencia, getAllDependencias };