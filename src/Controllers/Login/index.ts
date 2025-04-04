/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Login Controllers:');
logger.level = 'all';

/** PERSOALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createAuthorizationError} from "../../Library/Errors/index";

import { Request, Response } from "express";
import { IsEmail, IsPassword } from '../../Library/Validations';

const Login = (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if(!IsEmail(email)){
            throw createAuthorizationError('El email no es válido');
        }
        if(!IsPassword(password)){
            throw createAuthorizationError('La contraseña no es válida'); 
        }
        res.status(200).json({
            message: "Login successful",
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
    Login
}