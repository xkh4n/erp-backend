import { Request, Response, NextFunction } from 'express';
import { decodedToken } from '../../Library/Auth/JSWebToken';
import User from '../../Models/userModel';
import Roles from '../../Models/rolesModel';
import { createAuthorizationError, createNotFoundError } from '../../Library/Errors';
import { ISession } from '../../Interfaces';

/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Auth Middleware:');
logger.level = 'all';

// Extender Request para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                nombre?: string;
                role: string;
                permissions: string[];
                sessionId?: string;
            };
        }
    }
}

/**
 * Middleware para requerir autenticación JWT
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = createAuthorizationError('Token de acceso requerido');
            res.status(error.code).json(error.toJSON());
            return;
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const payload = decodedToken(token) as any;
            
            // Verificar que el token es de tipo access
            if (payload.token_type !== 'access') {
                const error = createAuthorizationError('Tipo de token inválido');
                res.status(error.code).json(error.toJSON());
                return;
            }
            
            // Verificar que el usuario existe y está activo
            const user = await User.findById(payload.userId).select('isActive username');
            if (!user || !user.isActive) {
                const error = createAuthorizationError('Usuario no válido o inactivo');
                res.status(error.code).json(error.toJSON());
                return;
            }

            // Agregar usuario al request
            req.user = {
                id: payload.userId,
                username: payload.username,
                nombre: payload.nombre,
                role: payload.role,
                permissions: payload.permissions,
                sessionId: payload.sessionId
            };

            next();
        } catch (tokenError) {
            const error = createAuthorizationError('Token inválido o expirado');
            res.status(error.code).json(error.toJSON());
            return;
        }
    } catch (error) {
        console.error('Error en requireAuth:', error);
        const serverError = createAuthorizationError('Error de autenticación');
        res.status(serverError.code).json(serverError.toJSON());
        return;
    }
};

/**
 * Middleware para requerir autenticación por sesión
 */
export const requireSession = (req: Request, res: Response, next: NextFunction): void => {
    const session = req.session as ISession;
    if (!req.session || !session.userId) {
        const error = createAuthorizationError('Sesión requerida');
        res.status(error.code).json(error.toJSON());
        return;
    }

    // Agregar usuario al request desde la sesión
    req.user = {
        id: session.userId!,
        username: session.username!,
        role: session.role!,
        permissions: session.permissions || []
    };

    next();
};

/**
 * Middleware para autenticación híbrida (JWT o Sesión)
 */
export const requireAuthOrSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Intentar autenticación JWT primero
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        await requireAuth(req, res, next);
        return;
    }

    // Si no hay JWT, intentar sesión
    const session = req.session as ISession;
    if (req.session && session.userId) {
        requireSession(req, res, next);
        return;
    }

    // Si no hay ninguna, error
    const error = createAuthorizationError('Autenticación requerida (JWT o Sesión)');
    res.status(error.code).json(error.toJSON());
};

/**
 * Middleware para verificar permisos específicos
 */
export const requirePermission = (resource: string, action: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            const error = createAuthorizationError('Usuario no autenticado');
            res.status(error.code).json(error.toJSON());
            return;
        }

        const requiredPermission = `${resource}:${action}`;
        const resourcePermission = resource; // También buscar solo el recurso
        
        // Verificar si tiene el permiso completo (resource:action) o solo el recurso
        const hasPermission = req.user.permissions.includes(requiredPermission) ||
                            req.user.permissions.includes(resourcePermission);
        
        if (!hasPermission) {
            logger.warn(`Usuario ${req.user.username} intentó acceder sin permiso: ${requiredPermission}. Permisos disponibles: ${req.user.permissions.join(', ')}`);
            const error = createAuthorizationError(`Permiso requerido: ${requiredPermission}`);
            res.status(error.code).json(error.toJSON());
            return;
        }

        next();
    };
};

/**
 * Middleware para verificar múltiples permisos (AND)
 */
export const requireAllPermissions = (permissions: Array<{resource: string, action: string}>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            const error = createAuthorizationError('Usuario no autenticado');
            res.status(error.code).json(error.toJSON());
            return;
        }

        const requiredPermissions = permissions.map(p => `${p.resource}:${p.action}`);
        const missingPermissions = requiredPermissions.filter(
            perm => !req.user!.permissions.includes(perm)
        );

        if (missingPermissions.length > 0) {
            const error = createAuthorizationError(
                `Permisos requeridos: ${missingPermissions.join(', ')}`
            );
            res.status(error.code).json(error.toJSON());
            return;
        }

        next();
    };
};

/**
 * Middleware para verificar al menos uno de varios permisos (OR)
 */
export const requireAnyPermission = (permissions: Array<{resource: string, action: string}>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            const error = createAuthorizationError('Usuario no autenticado');
            res.status(error.code).json(error.toJSON());
            return;
        }

        const requiredPermissions = permissions.map(p => `${p.resource}:${p.action}`);
        const hasPermission = requiredPermissions.some(
            perm => req.user!.permissions.includes(perm)
        );

        if (!hasPermission) {
            const error = createAuthorizationError(
                `Se requiere al menos uno de estos permisos: ${requiredPermissions.join(', ')}`
            );
            res.status(error.code).json(error.toJSON());
            return;
        }

        next();
    };
};

/**
 * Middleware para verificar rol específico
 */
export const requireRole = (roleName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            const error = createAuthorizationError('Usuario no autenticado');
            res.status(error.code).json(error.toJSON());
            return;
        }

        if (req.user.role !== roleName) {
            const error = createAuthorizationError(`Rol requerido: ${roleName}`);
            res.status(error.code).json(error.toJSON());
            return;
        }

        next();
    };
};

/**
 * Middleware opcional de autenticación (no falla si no hay auth)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            
            try {
                const payload = decodedToken(token) as any;
                
                // Verificar que el token es de tipo access
                if (payload.token_type === 'access') {
                    const user = await User.findById(payload.userId).select('isActive username');
                    if (user && user.isActive) {
                        req.user = {
                            id: payload.userId,
                            username: payload.username,
                            role: payload.role,
                            permissions: payload.permissions,
                            sessionId: payload.sessionId
                        };
                    }
                }
            } catch (tokenError) {
                // Token inválido, pero no fallar - continuar sin auth
            }
        } else if (req.session && (req.session as ISession).userId) {
            // Intentar sesión
            const session = req.session as ISession;
            req.user = {
                id: session.userId!,
                username: session.username!,
                role: session.role!,
                permissions: session.permissions || []
            };
        }

        next();
    } catch (error) {
        // Error en autenticación opcional - continuar sin auth
        next();
    }
};