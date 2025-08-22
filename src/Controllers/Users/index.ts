/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Users Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createValidationError, createConflictError,createNotFoundError } from "../../Library/Errors/index";

/* INTERFACES */
import {IPersons, IUser} from '../../Interfaces';

/* MODELS */
import Persons from '../../Models/personsModel';
import User from '../../Models/userModel';
import Roles from '../../Models/rolesModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsId } from '../../Library/Validations';

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json({
            codigo: 200,
            message: '✅ Usuarios obtenidos exitosamente',
            data: users
        });
    } catch (error) {
        logger.error('Error en getAllUsers:', error);
        const serverError = createServerError('Sucedió un error inesperado al obtener los Usuarios');
        res.status(serverError.code).json(serverError.toJSON());
    }
};

const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;
    try {
        if(!IsId(id)){
            throw createValidationError('ID de usuario inválido');
        }
        const user = await User.findById(id);
        if (!user) {
            throw createNotFoundError('Usuario no encontrado');
        }
        res.status(200).json({
            codigo: 200,
            message: '✅ Usuario obtenido exitosamente',
            data: user
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

const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.body;
    try {
        if(!username){
            throw createValidationError('Nombre de usuario inválido');
        }
        const user = await User.findOne({ username });
        if (!user) {
            throw createNotFoundError('Usuario no encontrado');
        }
        res.status(200).json({
            codigo: 200,
            message: '✅ Usuario obtenido exitosamente',
            data: user
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
    getAllUsers,
    getUserById,
    getUserByUsername
}