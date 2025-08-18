/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Login Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createAuthorizationError} from "../../Library/Errors/index";

/* MODELS */
import User  from "../../Models/userModel";
import Roles from "../../Models/rolesModel";

/* INTERFACES */
import { IUser, ISession } from "../../Interfaces/index";

/* AUTH SERVICES */
import { JWTService } from "../../Library/Auth/jwt";

import { Request, Response } from "express";
import { IsUsername, IsPassword } from '../../Library/Validations';
import { comparePassword } from '../../Library/Encrypt';

const Login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        logger.warn(`Intentando iniciar sesión con el username: ${username} desde IP: ${ipAddress}`);
        
        if(!IsUsername(username)){
            throw createAuthorizationError('El username no es válido');
        }
        if(!IsPassword(password)){
            throw createAuthorizationError('La contraseña no es válida'); 
        }
        
        const UserExist = await User.findOne({ username: username })
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            })
            .then().catch((error: any) => {
                if (error.code === 11000) {
                    throw createAuthorizationError('El username ya está registrado');
                } else {
                    throw createServerError('Sucedió un error Inesperado');
                }
            });
            
        if (!UserExist) {
            throw createNotFoundError('Error en Inicio de Sesión','Las Credenciales del usuario no son válidas');
        }
        
        if (!UserExist.isActive) {
            throw createAuthorizationError('El usuario no está activo');
        }
        
        // Verificar si la cuenta está bloqueada
        if (UserExist.isLocked) {
            throw createAuthorizationError('Cuenta temporalmente bloqueada por múltiples intentos fallidos');
        }
        
        const passwordMatch = await comparePassword(password, UserExist.password);
        if (!passwordMatch) {
            // Incrementar intentos de login fallidos
            await UserExist.incLoginAttempts();
            throw createAuthorizationError('La contraseña no es válida');
        }
        
        // Login exitoso - resetear intentos y actualizar último login
        await UserExist.resetLoginAttempts();
        await UserExist.updateOne({
            lastLogin: new Date(),
            lastLoginIP: ipAddress
        });
        
        // Preparar payload para JWT
        const role = UserExist.role as any;
        const permissions = role.permissions.map((p: any) => `${p.resource}:${p.action}`);
        
        const tokenPayload = {
            userId: UserExist._id.toString(),
            username: UserExist.username,
            role: role.name,
            permissions
        };
        
        // Generar tokens
        const tokens = await JWTService.generateTokenPair(tokenPayload, userAgent, ipAddress);
        
        // También crear sesión si el cliente lo prefiere
        if (req.session) {
            const session = req.session as ISession;
            session.userId = UserExist._id.toString();
            session.username = UserExist.username;
            session.role = role.name;
            session.permissions = permissions;
        }
        
        logger.info(`Login exitoso para usuario: ${username}`);
        
        res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    id: UserExist._id,
                    username: UserExist.username,
                    role: role.name,
                    isActive: UserExist.isActive
                },
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn
                }
            }
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

const RefreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        if (!refreshToken) {
            throw createAuthorizationError('Refresh token requerido');
        }
        
        const tokens = await JWTService.rotateRefreshToken(refreshToken, userAgent, ipAddress);
        
        if (!tokens) {
            throw createAuthorizationError('Refresh token inválido o expirado');
        }
        
        res.status(200).json({
            message: "Token renovado exitosamente",
            data: {
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn
                }
            }
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error al renovar token');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const Logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user?.id;
        
        if (refreshToken) {
            // Revocar el refresh token específico
            await JWTService.revokeTokenFamily(refreshToken);
        }
        
        if (userId) {
            // Opcionalmente revocar todos los tokens del usuario
            // await JWTService.revokeAllUserTokens(userId);
        }
        
        // Destruir sesión si existe
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    logger.error('Error al destruir sesión:', err);
                }
            });
        }
        
        res.status(200).json({
            message: "Logout exitoso"
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error en logout');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const LogoutAll = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            throw createAuthorizationError('Usuario no autenticado');
        }
        
        // Revocar todos los tokens del usuario
        await JWTService.revokeAllUserTokens(userId);
        
        // Destruir sesión si existe
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    logger.error('Error al destruir sesión:', err);
                }
            });
        }
        
        res.status(200).json({
            message: "Logout de todas las sesiones exitoso"
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error en logout completo');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export{
    Login,
    RefreshToken,
    Logout,
    LogoutAll
}