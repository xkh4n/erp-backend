/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Registro Controllers:');
logger.level = 'all';

/* MODELS */
import User  from "../../Models/userModel";

/** PERSONALIZED ERRORS */
import {createServerError, createAuthorizationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IUser } from "../../Interfaces/index";

import { Request, Response } from "express";
import { IsEmail, IsParagraph, IsPassword } from '../../Library/Validations';
import { hashPassword } from '../../Library/Encrypt';

const NewUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if(!IsEmail(email)){
            throw createAuthorizationError('El email no es válido');
        }
        if(!IsPassword(password)){
            throw createAuthorizationError('La contraseña no es válida'); 
        }
        if(!name){
            throw createAuthorizationError('El nombre es obligatorio');
        }
        if(!IsParagraph(name)){
            throw createAuthorizationError('El nombre no es válido');
        }
        const passwordHash = hashPassword(password);
        if(!passwordHash){
            throw createServerError('Sucedió un error Inesperado');
        }
        const newUser: IUser = {
            name: name,
            email: email,
            password: passwordHash,
            role: "guest",
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const user = new User(newUser);
        const userSave = await user.save().then().catch((error: any) => {
            if (error.code === 11000) {
                throw createAuthorizationError('El email ya está registrado');
            } else {
                throw createServerError('Sucedió un error Inesperado');
            }
        });
        if (!userSave) {
            throw createServerError('Sucedió un error Inesperado');
        }
        res.status(200).json({
            message: "Registro realizado con éxito",
            data: userSave
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

export{
    NewUser
}