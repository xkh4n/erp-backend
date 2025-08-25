/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Login Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createAuthorizationError} from "../../Library/Errors/index";

/* MODELS */
import User  from "../../Models/userModel";
import Persons from '../../Models/personsModel';
import Roles from "../../Models/rolesModel";

/* INTERFACES */
import { IUser, ISession } from "../../Interfaces/index";

/* AUTH SERVICES */
import { createAccessToken, createRefreshToken, decodedRefreshToken } from '../../Library/Auth/JSWebToken';
import { JWTService } from "../../Library/Auth/jwt";

import { Request, Response } from "express";
import { IsUsername, IsPassword } from '../../Library/Validations';
import { comparePassword } from '../../Library/Encrypt';

const Login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if(!IsUsername(username)){
            throw createAuthorizationError('El username no es válido');
        }
        if(!IsPassword(password)){
            throw createAuthorizationError('La contraseña no es válida');
        }
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        logger.warn(`Intentando iniciar sesión con el username: ${username} desde IP: ${ipAddress}`);
        
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
        const persona = await Persons.findById(UserExist.personId);
        // Login exitoso - resetear intentos y actualizar último login
        await UserExist.resetLoginAttempts();
        await UserExist.updateOne({
            lastLogin: new Date(),
            lastLoginIP: ipAddress
        });
        
        // Preparar payload para JWT
        const role = UserExist.role as any;
        const permissions = role.permissions.map((p: any) => {
            // Si el permiso tiene resource y action, usar el formato completo
            if (p.resource && p.action) {
                return `${p.resource}:${p.action}`;
            }
            // Si solo tiene name, usar solo el name
            return p.name;
        });
        
        // También crear sesión si el cliente lo prefiere
        let sessionId: string = '';
        if (req.session) {
            const session = req.session as ISession;
            session.userId = UserExist._id.toString();
            session.username = UserExist.username;
            session.role = role.name;
            session.permissions = permissions;
            sessionId = req.session.id || '';
            logger.info(`✅ Sesión creada exitosamente con ID: ${sessionId} para usuario: ${username}`);
        } else {
            logger.warn('⚠️  No hay objeto de sesión disponible - continuando sin sesión');
            logger.debug('Verificar que las variables SESSION_SECRET y SESSION_TTL_HOURS estén configuradas');
        }
        
        res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    id: UserExist._id,
                    username: UserExist.username,
                    nombre: persona?.name || '',
                    role: role.name,
                    isActive: UserExist.isActive
                },
                tokens: {
                    accessToken: createAccessToken(UserExist._id.toString(), UserExist.username, persona?.name || '', role.name, permissions, sessionId),
                    refreshToken: createRefreshToken(UserExist._id.toString(), UserExist.username, persona?.name || '', role.name, permissions, sessionId)
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
        
        logger.info(`Intentando renovar refresh token desde IP: ${ipAddress}`);
        logger.debug(`Refresh token recibido: ${refreshToken?.substring(0, 20)}...`);
        
        if (!refreshToken) {
            throw createAuthorizationError('Refresh token requerido');
        }

        // Decodificar y validar el refresh token
        const decodedToken = decodedRefreshToken(refreshToken);
        
        if (!decodedToken || typeof decodedToken === 'string') {
            throw createAuthorizationError('Refresh token inválido');
        }

        // Extraer información del token decodificado
        const { userId, username, nombre, role, permissions, sessionId } = decodedToken as any;

        // Verificar que el token sea de tipo refresh
        if (decodedToken.token_type !== 'refresh') {
            throw createAuthorizationError('Token inválido: se esperaba refresh token');
        }

        // Generar nuevos tokens
        const newAccessToken = createAccessToken(userId, username, nombre || '', role, permissions, sessionId);
        const newRefreshToken = createRefreshToken(userId, username, nombre || '', role, permissions, sessionId);

        logger.info(`Token renovado exitosamente para usuario: ${username}`);

        res.status(200).json({
            message: "Token renovado exitosamente",
            data: {
                tokens: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: "3h"
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