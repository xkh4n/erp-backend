/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Permissions Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError } from "../../Library/Errors/index";

/* INTERFACES */
import { IPermissions } from '../../Interfaces';

/* MODELS */
import Permissions from '../../Models/permissionsModel';

/* DEPENDENCIES */
import { Request, Response } from 'express';
import { getChileDateTime } from '../../Library/Utils/ManageDate';

const createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        const promises = [];
        for(let i = 0; i < total; i++) {
            const Permisos: IPermissions = req.body[i];
            const { name, description, resource, action, isActive } = Permisos;
            // Validate request data
            if (!name || !description || !resource || !action || isActive === undefined) {
                logger.error('Faltan datos requeridos');
                throw new Error('Faltan datos requeridos');
            }
            const newPermission =  new Permissions({
                name,
                description,
                resource,
                action,
                isActive,
                fechaCreacion: getChileDateTime(),
                fechaModificacion: getChileDateTime()
            });
            promises.push(newPermission.save()
                .then(() => {
                    logger.info(`Permiso: ${name} guardado correctamente.`);
                    return newPermission;
                })
            );
        }
        const permisos = await Promise.all(promises);
        res.status(201).json({
            codigo: 201,
            data: permisos
        });
    } catch (error) {
console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al procesar el Kardex');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getPermissionsId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { names } = req.body;
        
        // Buscar permisos por nombres
        const permissions = await Permissions.find({ 
            name: { $in: names },
            isActive: true 
        }).select('_id name');
        
        if (permissions.length === 0) {
            logger.warn(`No se encontraron permisos para los nombres: ${names.join(', ')}`);
            res.status(404).json({ 
                codigo: 404,
                message: 'No se encontraron permisos con los nombres especificados' 
            });
            return;
        }
        
        // Crear array de IDs en el mismo orden que los nombres solicitados
        const permissionMap = new Map(permissions.map(p => [p.name, p._id]));
        const ids = names.map((name: string) => permissionMap.get(name)).filter(Boolean);
        
        // Verificar si algunos nombres no fueron encontrados
        const foundNames = permissions.map(p => p.name);
        const notFoundNames = names.filter((name: string) => !foundNames.includes(name));
        
        const response: any = {
            codigo: 200,
            data: {
                ids,
                found: foundNames.length,
                total: names.length
            }
        };
        
        if (notFoundNames.length > 0) {
            response.data.notFound = notFoundNames;
            logger.warn(`Permisos no encontrados: ${notFoundNames.join(', ')}`);
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al buscar los permisos');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getPermissionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        // Buscar permiso por ID
        const permission = await Permissions.findById(id);
        if (!permission) {
            logger.warn(`Permiso no encontrado: ${id}`);
            res.status(404).json({
                codigo: 404,
                message: 'Permiso no encontrado'
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            data: permission
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al buscar el permiso');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    createPermission,
    getPermissionsId,
    getPermissionById
};