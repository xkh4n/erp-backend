/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Roles Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createValidationError } from "../../Library/Errors/index";

/* INTERFACES */
import { IRoles } from '../../Interfaces';

/* MODELS */
import Roles from '../../Models/rolesModel';
import Permissions from '../../Models/permissionsModel';

/* DEPENDENCIES */
import { Request, Response } from 'express';
import { getChileDateTime } from '../../Library/Utils/ManageDate';

const createRole = async (req: Request, res: Response): Promise<void> => {
    try {
        // Verificar si req.body es un array o un objeto
        const rolesData = Array.isArray(req.body) ? req.body : [req.body];
        const promises = [];
        
        for (const roleData of rolesData) {
            const { name, description, permissions, isActive } = roleData;

            // Validate request data (ya validado por middleware, pero doble verificación)
            if (!name || !description || !permissions || isActive === undefined) {
                logger.error('Faltan datos requeridos');
                throw createValidationError('Faltan datos requeridos');
            }

            // Validar que todos los IDs de permisos existan
            const existingPermissions = await Permissions.find({ 
                _id: { $in: permissions },
                isActive: true 
            }).select('_id name');

            if (existingPermissions.length !== permissions.length) {
                const foundIds = existingPermissions.map(p => p._id.toString());
                const invalidIds = permissions.filter((id: string) => !foundIds.includes(id));
                
                logger.error(`IDs de permisos no válidos o inactivos: ${invalidIds.join(', ')}`);
                throw createServerError(`Los siguientes IDs de permisos no existen o están inactivos: ${invalidIds.join(', ')}`);
            }

            logger.info(`Permisos validados para el rol ${name}: ${existingPermissions.map(p => p.name).join(', ')}`);

            const newRole = new Roles({
                name,
                description,
                permissions,
                isActive: isActive,
                fechaCreacion: getChileDateTime(),
                fechaModificacion: getChileDateTime()
            });

            promises.push(newRole.save()
                .then(() => {
                    logger.info(`Rol: ${name} guardado correctamente.`);
                    return newRole;
                })
            );
        }
        
        const createdRoles = await Promise.all(promises);
        res.status(201).json({ 
            codigo: 201,
            message: 'Roles creados con éxito', 
            data: createdRoles 
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al procesar el Role');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    createRole,
}