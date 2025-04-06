/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Login Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createAuthorizationError} from "../../Library/Errors/index";

/* MODELS */
import User  from "../../Models/userModel";

/* INTERFACES */
import { IUser } from "../../Interfaces/index";

import { Request, Response } from "express";
import { IsEmail, IsParagraph, IsPassword } from '../../Library/Validations';
import { comparePassword } from '../../Library/Encrypt';

const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if(!IsEmail(email)){
            throw createAuthorizationError('El email no es válido');
        }
        if(!IsPassword(password)){
            throw createAuthorizationError('La contraseña no es válida'); 
        }
        const UserExist = await User.findOne({ email: email }).then().catch((error: any) => {
            if (error.code === 11000) {
                throw createAuthorizationError('El email ya está registrado');
            } else {
                throw createServerError('Sucedió un error Inesperado');
            }
        });
        if (!UserExist) {
            throw createNotFoundError('El usuario no existe');
        }
        if (!UserExist.isActive) {
            throw createAuthorizationError('El usuario no está activo');
        }
        const passwordMatch = await comparePassword(password, UserExist.password);
        if (!passwordMatch) {
            throw createAuthorizationError('La contraseña no es válida');
        }
        res.status(200).json({
            message: "Login successful",
            data:UserExist
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