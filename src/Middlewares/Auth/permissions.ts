import { Request, Response, NextFunction } from 'express';
import { createAuthorizationError } from '../../Library/Errors';
import Permissions from '../../Models/permissionsModel';
import { IPermissions } from '../../Interfaces';

/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Permissions Middleware:');
logger.level = 'all';

/**
 * Cache para permisos cargados desde la base de datos
 * Se actualiza automáticamente cada cierto tiempo
 */
let permissionsCache: IPermissions[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Carga y cachea los permisos desde la base de datos
 */
async function loadPermissionsFromDB(): Promise<IPermissions[]> {
    try {
        const now = Date.now();
        
        // Verificar si el cache está vigente
        if (permissionsCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
            return permissionsCache;
        }

        // Cargar permisos activos desde la base de datos
        const permissions = await Permissions.find({ isActive: true }).lean();
        permissionsCache = permissions;
        lastCacheUpdate = now;
        
        logger.info(`Permisos cargados desde BD: ${permissions.length} permisos activos`);
        return permissions;
    } catch (error) {
        logger.error('Error cargando permisos desde BD:', error);
        // En caso de error, devolver cache anterior si existe
        return permissionsCache;
    }
}

/**
 * Verifica si un permiso específico existe en la base de datos
 */
async function validatePermissionExists(permissionName: string): Promise<boolean> {
    const permissions = await loadPermissionsFromDB();
    return permissions.some(p => p.name === permissionName);
}

/**
 * Obtiene todos los nombres de permisos válidos desde la base de datos
 */
export async function getValidPermissionNames(): Promise<string[]> {
    const permissions = await loadPermissionsFromDB();
    return permissions.map(p => p.name);
}

/**
 * Middleware mejorado para validar permisos específicos del ERP
 * Utiliza permisos dinámicos cargados desde la base de datos
 */
export const requireERPPermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                const error = createAuthorizationError('Usuario no autenticado');
                res.status(error.code).json(error.toJSON());
                return;
            }

            // Validar que el permiso existe en la base de datos
            const permissionExists = await validatePermissionExists(permissionName);
            if (!permissionExists) {
                logger.error(`Permiso no válido: ${permissionName}`);
                const error = createAuthorizationError(`Permiso no válido: ${permissionName}`);
                res.status(error.code).json(error.toJSON());
                return;
            }

            // Verificar si el usuario tiene el permiso
            const hasPermission = req.user.permissions.includes(permissionName);
            
            if (!hasPermission) {
                logger.warn(`Usuario ${req.user.username} intentó acceder sin permiso: ${permissionName}. Permisos disponibles: ${req.user.permissions.join(', ')}`);
                const error = createAuthorizationError(`Permiso requerido: ${permissionName}`);
                res.status(error.code).json(error.toJSON());
                return;
            }

            logger.info(`Usuario ${req.user.username} accedió con permiso: ${permissionName}`);
            next();
        } catch (error) {
            logger.error('Error validando permiso:', error);
            const serverError = createAuthorizationError('Error interno validando permisos');
            res.status(serverError.code).json(serverError.toJSON());
            return;
        }
    };
};

/**
 * Middleware para validar múltiples permisos ERP (AND)
 */
export const requireAllERPPermissions = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                const error = createAuthorizationError('Usuario no autenticado');
                res.status(error.code).json(error.toJSON());
                return;
            }

            // Validar que todos los permisos existen en la base de datos
            for (const permission of permissions) {
                const exists = await validatePermissionExists(permission);
                if (!exists) {
                    logger.error(`Permiso no válido: ${permission}`);
                    const error = createAuthorizationError(`Permiso no válido: ${permission}`);
                    res.status(error.code).json(error.toJSON());
                    return;
                }
            }

            // Verificar que el usuario tiene todos los permisos
            const missingPermissions = permissions.filter(
                perm => !req.user!.permissions.includes(perm)
            );

            if (missingPermissions.length > 0) {
                logger.warn(`Usuario ${req.user.username} no tiene permisos: ${missingPermissions.join(', ')}`);
                const error = createAuthorizationError(
                    `Permisos requeridos: ${missingPermissions.join(', ')}`
                );
                res.status(error.code).json(error.toJSON());
                return;
            }

            next();
        } catch (error) {
            logger.error('Error validando permisos múltiples:', error);
            const serverError = createAuthorizationError('Error interno validando permisos');
            res.status(serverError.code).json(serverError.toJSON());
            return;
        }
    };
};

/**
 * Middleware para validar al menos uno de varios permisos ERP (OR)
 */
export const requireAnyERPPermission = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                const error = createAuthorizationError('Usuario no autenticado');
                res.status(error.code).json(error.toJSON());
                return;
            }

            // Validar que al menos uno de los permisos existe en la base de datos
            const validPermissions = [];
            for (const permission of permissions) {
                const exists = await validatePermissionExists(permission);
                if (exists) {
                    validPermissions.push(permission);
                }
            }

            if (validPermissions.length === 0) {
                logger.error(`Ningún permiso válido encontrado: ${permissions.join(', ')}`);
                const error = createAuthorizationError('Permisos especificados no son válidos');
                res.status(error.code).json(error.toJSON());
                return;
            }

            // Verificar que el usuario tiene al menos uno de los permisos válidos
            const hasPermission = validPermissions.some(
                perm => req.user!.permissions.includes(perm)
            );

            if (!hasPermission) {
                logger.warn(`Usuario ${req.user.username} no tiene ninguno de estos permisos: ${validPermissions.join(', ')}`);
                const error = createAuthorizationError(
                    `Se requiere al menos uno de estos permisos: ${validPermissions.join(', ')}`
                );
                res.status(error.code).json(error.toJSON());
                return;
            }

            next();
        } catch (error) {
            logger.error('Error validando permisos alternativos:', error);
            const serverError = createAuthorizationError('Error interno validando permisos');
            res.status(serverError.code).json(serverError.toJSON());
            return;
        }
    };
};

/**
 * Middleware condicional para permisos ERP (basado en variables de entorno)
 */
const ENABLE_PERMISSIONS = process.env.ENABLE_PERMISSIONS === 'true';

export const conditionalERPPermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (ENABLE_PERMISSIONS) {
            return requireERPPermission(permissionName)(req, res, next);
        }
        next();
    };
};

/**
 * Sistema de mapeo dinámico de endpoints a permisos
 * Estos permisos deben existir en la base de datos
 */
interface EndpointPermissionMapping {
    [key: string]: string[];
}

/**
 * Carga el mapeo de endpoints desde la base de datos o configuración
 * Este mapeo puede ser configurado dinámicamente por administradores
 */
async function loadEndpointPermissions(): Promise<EndpointPermissionMapping> {
    // Por ahora mantenemos un mapeo básico, pero esto podría cargarse desde BD
    // en una tabla de configuración de endpoints
    return {
        // Gestión de Usuarios
        'POST:/users/all': ['admin_read'],
        'POST:/users/byid': ['admin_read'],
        'POST:/users/byusername': ['admin_read'],
        'PUT:/users/create': ['manage_users'],
        'DELETE:/users/delete': ['manage_users'],
        'POST:/users/update': ['manage_users'],

        // Gestión de Roles y Permisos
        'PUT:/permission/create': ['manage_roles'],
        'POST:/permission/ids': ['read'],
        'POST:/permission/byid': ['read'],

        // Gestión de Productos
        'PUT:/producto/nuevo': ['create'],
        'POST:/producto/todos': ['read'],
        'POST:/producto/categoria': ['read'],
        'POST:/producto/idcategoria': ['read'],
        'POST:/producto/recibir': ['update'],

        // Gestión de Categorías
        'PUT:/categoria/nuevo': ['create'],
        'POST:/categoria/todos': ['read'],
        'POST:/categoria/getbyid': ['read'],
        'POST:/categoria/last': ['read'],

        // Gestión Organizacional
        'PUT:/gerencia/nueva': ['manage_names'],
        'POST:/gerencia/todas': ['read'],
        'PUT:/subgerencia/nueva': ['manage_names'],
        'POST:/subgerencia/todas': ['read'],
        'PUT:/depto/nuevo': ['manage_names'],
        'POST:/depto/todos': ['read'],

        // Endpoints públicos
        'POST:/login/authenticate': ['read_public'],
        'POST:/login/refresh': ['read_public'],
        'POST:/login/logout': ['read_public'],
        'GET:/health': ['read_public'],
        'POST:/health': ['read_public'],
    };
}

/**
 * Función para obtener permisos requeridos para un endpoint
 * Valida que los permisos existan en la base de datos
 */
export const getRequiredPermissions = async (method: string, path: string): Promise<string[]> => {
    try {
        const endpointMappings = await loadEndpointPermissions();
        const key = `${method.toUpperCase()}:${path}`;
        const requiredPermissions = endpointMappings[key] || ['read'];

        // Validar que todos los permisos requeridos existen en la BD
        const validPermissions = [];
        for (const permission of requiredPermissions) {
            if (permission === 'read_public') {
                // Permiso especial que no necesita estar en BD
                validPermissions.push(permission);
            } else {
                const exists = await validatePermissionExists(permission);
                if (exists) {
                    validPermissions.push(permission);
                } else {
                    logger.warn(`Permiso ${permission} requerido para ${key} no existe en BD`);
                }
            }
        }

        return validPermissions.length > 0 ? validPermissions : ['read'];
    } catch (error) {
        logger.error('Error obteniendo permisos requeridos:', error);
        return ['read']; // Fallback seguro
    }
};

/**
 * Middleware automático para validar permisos basado en ruta
 * Utiliza el sistema dinámico de permisos
 */
export const autoPermissionCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const requiredPermissions = await getRequiredPermissions(req.method, req.path);
        
        // Si es un endpoint público, continuar
        if (requiredPermissions.includes('read_public')) {
            return next();
        }

        // Aplicar validación de permisos dinámicamente
        return requireAnyERPPermission(requiredPermissions)(req, res, next);
    } catch (error) {
        logger.error('Error en autoPermissionCheck:', error);
        const serverError = createAuthorizationError('Error interno validando permisos automáticos');
        res.status(serverError.code).json(serverError.toJSON());
        return;
    }
};

/**
 * Función utilitaria para limpiar el cache de permisos
 * Útil cuando se actualizan permisos en la base de datos
 */
export const clearPermissionsCache = (): void => {
    permissionsCache = [];
    lastCacheUpdate = 0;
    logger.info('Cache de permisos limpiado');
};

/**
 * Función para precargar permisos al iniciar la aplicación
 */
export const initializePermissionsCache = async (): Promise<void> => {
    try {
        await loadPermissionsFromDB();
        logger.info('Cache de permisos inicializado correctamente');
    } catch (error) {
        logger.error('Error inicializando cache de permisos:', error);
    }
};