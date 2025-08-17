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
        const total = Object.keys(req.body).length;
        const promise = [];
        for (let i = 0; i < total; i++) {
            const { name, email, password } = req.body[i];
            logger.info(`Registrando usuario: ${name} - ${email}`);
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
                username: name,
                password: passwordHash,
                role: null, // Assuming role is set later or is optional
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const userExists = await User.findOne({ email: email });
            if (userExists) {
                throw createAuthorizationError('El email ya está registrado');
            }
            promise.push(User.create(newUser).then().catch((error: any) => {
                if (error.code === 11000) {
                    throw createAuthorizationError('El email ya está registrado en la creacion'); 
                } 
            }));
        }
        const userSave = await Promise.all(promise).then().catch((error: any) => {
            if (error.code === 11000) {
                throw createAuthorizationError('El email ya está registrado');
            } else {
                throw createServerError('Sucedió un error Inesperado');
            }
        });
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