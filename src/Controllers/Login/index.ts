/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Login Controllers:');
logger.level = 'all';

/** PERSOALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createAuthorizationError} from "../../Library/Errors/index";

import { Request, Response } from "express";

const Login = (req: Request, res: Response) => {
    try {
        if (!req.body.user) {
            throw createNotFoundError('User not found');
        }
        if (!req.body.user.isActive) {
            throw createAuthorizationError('User is not active', { userId: req.body.id });
        }
        res.status(200).json({
            message: "Login successful",
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        const serverError = createServerError('Sucedión un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

export{
    Login
}