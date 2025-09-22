import { Request, Response } from 'express';
import { getValidPermissionNames } from '../../Middlewares/Auth/permissions';
import { createNotFoundError, createServerError } from '../../Library/Errors';

/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Permissions Controller:');
logger.level = 'all';

/**
 * Obtiene todos los permisos válidos del sistema
 * Endpoint público para que el frontend pueda validar permisos
 */
export const getValidPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
        logger.info('Solicitando lista de permisos válidos');
        
        const validPermissions = await getValidPermissionNames();
        
        if (!validPermissions || validPermissions.length === 0) {
            const error = createNotFoundError('No se encontraron permisos en el sistema');
            res.status(error.code).json(error.toJSON());
            return;
        }

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Permisos válidos obtenidos correctamente',
            data: {
                permissions: validPermissions,
                total: validPermissions.length
            }
        });

        logger.info(`Lista de ${validPermissions.length} permisos válidos enviada`);
        
    } catch (error) {
        logger.error('Error obteniendo permisos válidos:', error);
        const serverError = createServerError('Error interno obteniendo permisos');
        res.status(serverError.code).json(serverError.toJSON());
    }
};