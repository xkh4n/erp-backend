/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('CentroCostos Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createBadRequestError} from "../../Library/Errors/index";

/* INTERFACES */
import { ICentroCostos } from '../../Interfaces';

/* MODELS */
import CentroCostos from '../../Models/centrocostosModel';

/* DEPENDENCIES */
import { Request, Response } from 'express';
import { IsId } from '../../Library/Validations';

const newCentroCosto = async (req: Request, res: Response) => {
    try {
        // Verificar si es un array (creación masiva) o objeto individual
        const isArray = Array.isArray(req.body);
        const data = isArray ? req.body : [req.body];
        
        const createdCentros = [];
        
        for (const item of data) {
            const { codigo, nombre, descripcion } = item;
            
            // Verificar si ya existe un centro de costo con el mismo código
            const existingCentro = await CentroCostos.findOne({ codigo: codigo.toString().toUpperCase() });
            if (existingCentro) {
                throw createConflictError(`Ya existe un centro de costo con el código: ${codigo}`);
            }
            
            const ccosto = new CentroCostos({
                codigo: codigo.toString().toUpperCase(), // Asegurar que el código esté en mayúsculas
                nombre: nombre.trim(),
                descripcion: descripcion.trim()
            });
            
            const savedCentro = await ccosto.save();
            createdCentros.push(savedCentro);
            
            logger.info(`Centro de Costo: ${savedCentro.nombre} (${savedCentro.codigo}) guardado correctamente.`);
        }
        
        res.status(201).json({
            codigo: 201,
            message: `${createdCentros.length} centro(s) de costo creado(s) exitosamente`,
            data: isArray ? createdCentros : createdCentros[0]
        });
    } catch (error) {
        logger.error('Error al crear centro de costo:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else if (error.code === 11000) {
            // Error de duplicado de MongoDB
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];
            const conflictError = createConflictError(`Ya existe un centro de costo con ${field}: ${value}`);
            res.status(conflictError.code).json(conflictError.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al crear el centro de costo');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getCentroCostos = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'nombre', sortOrder = 'asc' } = req.query;
        
        // Construir filtro de búsqueda
        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { codigo: { $regex: search, $options: 'i' } },
                    { nombre: { $regex: search, $options: 'i' } },
                    { descripcion: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        // Configurar ordenamiento
        const sort = {};
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
        
        // Calcular paginación
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;
        
        // Ejecutar consultas
        const [centros, total] = await Promise.all([
            CentroCostos.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            CentroCostos.countDocuments(filter)
        ]);
        
        const totalPages = Math.ceil(total / limitNum);
        
        res.status(200).json({
            codigo: 200,
            message: 'Centros de costo obtenidos exitosamente',
            data: {
                centros,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        logger.error('Error al obtener centros de costo:', error);
        const serverError = createServerError('Error al obtener los centros de costo');
        res.status(serverError.code).json(serverError.toJSON());
    }
};

const getCentroCostoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if(!IsId(id)){
            throw createBadRequestError('ID inválido', 'El ID proporcionado no es válido');
        }
        const centro = await CentroCostos.findById(id);
        
        if (!centro) {
            throw createNotFoundError('Centro de costo no encontrado');
        }
        
        res.status(200).json({
            codigo: 200,
            message: 'Centro de costo obtenido exitosamente',
            data: centro
        });
    } catch (error) {
        logger.error('Error al obtener centro de costo por ID:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error al obtener el centro de costo');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const updateCentroCosto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Si se está actualizando el código, verificar que no exista otro con el mismo código
        if (updateData.codigo) {
            updateData.codigo = updateData.codigo.toUpperCase();
            const existingCentro = await CentroCostos.findOne({ 
                codigo: updateData.codigo, 
                _id: { $ne: id } 
            });
            
            if (existingCentro) {
                throw createConflictError(`Ya existe un centro de costo con el código: ${updateData.codigo}`);
            }
        }
        
        // Limpiar strings
        if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
        if (updateData.descripcion) updateData.descripcion = updateData.descripcion.trim();
        
        const updatedCentro = await CentroCostos.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedCentro) {
            throw createNotFoundError('Centro de costo no encontrado');
        }
        
        logger.info(`Centro de Costo actualizado: ${updatedCentro.nombre} (${updatedCentro.codigo})`);
        
        res.status(200).json({
            codigo: 200,
            message: 'Centro de costo actualizado exitosamente',
            data: updatedCentro
        });
    } catch (error) {
        logger.error('Error al actualizar centro de costo:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];
            const conflictError = createConflictError(`Ya existe un centro de costo con ${field}: ${value}`);
            res.status(conflictError.code).json(conflictError.toJSON());
        } else {
            const serverError = createServerError('Error al actualizar el centro de costo');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const deleteCentroCosto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const deletedCentro = await CentroCostos.findByIdAndDelete(id);
        
        if (!deletedCentro) {
            throw createNotFoundError('Centro de costo no encontrado');
        }
        
        logger.info(`Centro de Costo eliminado: ${deletedCentro.nombre} (${deletedCentro.codigo})`);
        
        res.status(200).json({
            codigo: 200,
            message: 'Centro de costo eliminado exitosamente',
            data: {
                id: deletedCentro._id,
                codigo: deletedCentro.codigo,
                nombre: deletedCentro.nombre
            }
        });
    } catch (error) {
        logger.error('Error al eliminar centro de costo:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Error al eliminar el centro de costo');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    newCentroCosto,
    getCentroCostos,
    getCentroCostoById,
    updateCentroCosto,
    deleteCentroCosto
};
