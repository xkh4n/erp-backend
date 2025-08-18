import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { createValidationError } from '../Errors';

// Schemas de validación
export const loginSchema = z.object({
    username: z.string()
        .min(3, 'El username debe tener al menos 3 caracteres')
        .max(50, 'El username no puede exceder 50 caracteres')
        .regex(/^[a-zA-Z0-9_.-]+$/, 'El username solo puede contener letras, números, guiones y puntos'),
    
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(128, 'La contraseña no puede exceder 128 caracteres')
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string()
        .min(1, 'El refresh token es requerido')
});

export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'La contraseña actual es requerida'),
    
    newPassword: z.string()
        .min(parseInt(process.env.PASSWORD_MIN_LENGTH!) || 12, `La nueva contraseña debe tener al menos ${process.env.PASSWORD_MIN_LENGTH || 12} caracteres`)
        .max(128, 'La contraseña no puede exceder 128 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
               'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial')
});

export const userCreateSchema = z.object({
    username: z.string()
        .min(3, 'El username debe tener al menos 3 caracteres')
        .max(50, 'El username no puede exceder 50 caracteres')
        .regex(/^[a-zA-Z0-9_.-]+$/, 'El username solo puede contener letras, números, guiones y puntos'),
    
    password: z.string()
        .min(parseInt(process.env.PASSWORD_MIN_LENGTH!) || 12, `La contraseña debe tener al menos ${process.env.PASSWORD_MIN_LENGTH || 12} caracteres`)
        .max(128, 'La contraseña no puede exceder 128 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
               'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'),
    
    roleId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'ID de rol inválido'),
    
    personId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'ID de persona inválido'),
    
    isActive: z.boolean()
        .optional()
        .default(true)
});

export const roleCreateSchema = z.object({
    name: z.string()
        .min(2, 'El nombre del rol debe tener al menos 2 caracteres')
        .max(100, 'El nombre del rol no puede exceder 100 caracteres')
        .regex(/^[a-zA-Z0-9\s_-]+$/, 'El nombre del rol contiene caracteres inválidos'),
    
    description: z.string()
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(500, 'La descripción no puede exceder 500 caracteres'),
    
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de permiso inválido'))
        .min(1, 'Debe asignar al menos un permiso'),
    
    isActive: z.boolean()
        .optional()
        .default(true)
});

export const permissionCreateSchema = z.object({
    name: z.string()
        .min(2, 'El nombre del permiso debe tener al menos 2 caracteres')
        .max(100, 'El nombre del permiso no puede exceder 100 caracteres'),
    
    description: z.string()
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(500, 'La descripción no puede exceder 500 caracteres'),
    
    resource: z.string()
        .min(2, 'El recurso debe tener al menos 2 caracteres')
        .max(50, 'El recurso no puede exceder 50 caracteres')
        .regex(/^[a-zA-Z0-9_-]+$/, 'El recurso contiene caracteres inválidos'),
    
    action: z.enum(['create', 'read', 'update', 'delete', 'list', 'manage'], {
        message: 'Acción inválida. Debe ser: create, read, update, delete, list o manage'
    }),
    
    isActive: z.boolean()
        .optional()
        .default(true)
});

export const objectIdSchema = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido')
});

// Middleware para validar con Zod
export const validateZod = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Sanitizar datos antes de validar
            const sanitizedBody = sanitizeInput(req.body);
            
            // Validar con Zod
            const validatedData = schema.parse(sanitizedBody);
            
            // Reemplazar body con datos validados y sanitizados
            req.body = validatedData;
            
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                const validationError = createValidationError('Errores de validación', errorMessages);
                res.status(validationError.code).json(validationError.toJSON());
                return;
            }
            
            const serverError = createValidationError('Error de validación');
            res.status(serverError.code).json(serverError.toJSON());
            return;
        }
    };
};

// Función para sanitizar input
function sanitizeInput(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'string') {
        return obj.trim();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(sanitizeInput);
    }
    
    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    
    return obj;
}

// Middleware de validación para arrays
export const validateArrayZod = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const body = req.body;
            
            // Si el body es un array, validar cada elemento
            if (Array.isArray(body)) {
                const validatedData = body.map(item => {
                    const sanitized = sanitizeInput(item);
                    return schema.parse(sanitized);
                });
                req.body = validatedData;
            } else {
                // Si no es array, validar como objeto único
                const sanitized = sanitizeInput(body);
                req.body = schema.parse(sanitized);
            }
            
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                const validationError = createValidationError('Errores de validación', errorMessages);
                res.status(validationError.code).json(validationError.toJSON());
                return;
            }
            
            const serverError = createValidationError('Error de validación');
            res.status(serverError.code).json(serverError.toJSON());
            return;
        }
    };
};
