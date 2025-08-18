/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Password Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createValidationError} from "../../Library/Errors/index";

/* MODELS */
import User  from "../../Models/userModel";

/* AUTH SERVICES */
import { PasswordService } from "../../Library/Auth/password";
import { hashPassword } from "../../Library/Encrypt";

import { Request, Response } from "express";

const ChangePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            throw createValidationError('Usuario no autenticado');
        }
        
        // Obtener usuario actual
        const user = await User.findById(userId).select('password');
        if (!user) {
            throw createNotFoundError('Usuario no encontrado');
        }
        
        // Cambiar contraseña usando el servicio
        const newPasswordHash = await PasswordService.changePassword(
            userId,
            currentPassword,
            newPassword,
            user.password
        );
        
        // Actualizar contraseña en BD
        await User.findByIdAndUpdate(userId, {
            password: newPasswordHash,
            passwordChangedAt: new Date()
        });
        
        logger.info(`Contraseña cambiada exitosamente para usuario: ${userId}`);
        
        res.status(200).json({
            message: "Contraseña cambiada exitosamente"
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error al cambiar contraseña');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const ResetPassword = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        
        // Verificar que el usuario que solicita el reset tenga permisos
        if (!req.user?.permissions.includes('users:manage')) {
            throw createValidationError('No tiene permisos para resetear contraseñas');
        }
        
        // Obtener usuario a resetear
        const user = await User.findById(userId);
        if (!user) {
            throw createNotFoundError('Usuario no encontrado');
        }
        
        // Generar contraseña temporal
        const temporaryPassword = PasswordService.generateTemporaryPassword();
        const temporaryPasswordHash = hashPassword(temporaryPassword);
        
        // Actualizar contraseña en BD
        await User.findByIdAndUpdate(userId, {
            password: temporaryPasswordHash,
            passwordChangedAt: new Date()
        });
        
        // Guardar en historial
        await PasswordService.savePasswordToHistory(userId, temporaryPasswordHash);
        
        logger.info(`Contraseña reseteada para usuario: ${userId} por: ${req.user.id}`);
        
        res.status(200).json({
            message: "Contraseña reseteada exitosamente",
            data: {
                temporaryPassword, // En producción, esto se enviaría por email
                username: user.username
            }
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error al resetear contraseña');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    ChangePassword,
    ResetPassword
};
