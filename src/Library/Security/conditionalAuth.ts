import { Request, Response, NextFunction } from 'express';
import { requireAuth, requirePermission, optionalAuth } from '../../Middlewares/Auth';
import { validateZod } from '../Validations/zod';

/**
 * Middleware condicional de autenticación basado en variables de entorno
 * Permite habilitar/deshabilitar autenticación por ambiente sin cambiar código
 */

// Variables de entorno para controlar autenticación
const ENABLE_AUTH = process.env.ENABLE_AUTH === 'true';
const ENABLE_PERMISSIONS = process.env.ENABLE_PERMISSIONS === 'true';
const ENABLE_VALIDATION = process.env.ENABLE_VALIDATION === 'true';

/**
 * Middleware de autenticación condicional
 * Si ENABLE_AUTH está deshabilitado, pasa al siguiente middleware
 */
export const conditionalAuth = (req: Request, res: Response, next: NextFunction) => {
    if (ENABLE_AUTH) {
        return requireAuth(req, res, next);
    }
    next();
};

/**
 * Middleware de permisos condicional
 * Si ENABLE_PERMISSIONS está deshabilitado, pasa al siguiente middleware
 */
export const conditionalPermission = (role: string, action: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (ENABLE_PERMISSIONS) {
            return requirePermission(role, action)(req, res, next);
        }
        next();
    };
};

/**
 * Middleware de validación condicional
 * Si ENABLE_VALIDATION está deshabilitado, pasa al siguiente middleware
 */
export const conditionalValidation = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (ENABLE_VALIDATION) {
            return validateZod(schema)(req, res, next);
        }
        next();
    };
};

/**
 * Middleware de autenticación opcional condicional
 * Para endpoints que pueden funcionar con o sin autenticación
 */
export const conditionalOptionalAuth = (req: Request, res: Response, next: NextFunction) => {
    if (ENABLE_AUTH) {
        return optionalAuth(req, res, next);
    }
    next();
};

// Log de configuración al inicializar
console.log('🔒 Configuración de Autenticación:');
console.log(`   - Autenticación: ${ENABLE_AUTH ? 'HABILITADA' : 'DESHABILITADA'}`);
console.log(`   - Permisos: ${ENABLE_PERMISSIONS ? 'HABILITADOS' : 'DESHABILITADOS'}`);
console.log(`   - Validación: ${ENABLE_VALIDATION ? 'HABILITADA' : 'DESHABILITADA'}`);