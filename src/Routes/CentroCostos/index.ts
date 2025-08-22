/* EXPRESS */
import { Router } from 'express';
const centroCostosRouter = Router();

/* CONTROLLER */
import { newCentroCosto, getCentroCostos, getCentroCostoById, updateCentroCosto, deleteCentroCosto } from '../../Controllers/CentroCostos/index';

/* MIDDLEWARES */
import { requireAuth, requirePermission } from '../../Middlewares/Auth';
import { 
    validateZod, 
    validateArrayZod,
    centroCostoCreateSchema, 
    centroCostoUpdateSchema,
    centroCostoArraySchema,
    objectIdSchema 
} from '../../Library/Validations/zod';

// Crear centro de costo individual
centroCostosRouter.put(
    '/ccosto/nuevo',
    requireAuth,
    requirePermission('data', 'create'),
    validateZod(centroCostoCreateSchema),
    newCentroCosto
);

// Crear múltiples centros de costo
centroCostosRouter.put(
    '/ccosto/bulk',
    requireAuth,
    requirePermission('data', 'create'),
    validateZod(centroCostoArraySchema),
    newCentroCosto
);

// Obtener todos los centros de costo
centroCostosRouter.post(
    '/ccosto/getall',
    requireAuth,
    requirePermission('data', 'read'),
    getCentroCostos
);

// Obtener centro de costo por ID
centroCostosRouter.post(
    '/ccosto/byid',
    requireAuth,
    requirePermission('data', 'read'),
    validateZod(objectIdSchema),
    getCentroCostoById
);

// Actualizar centro de costo
centroCostosRouter.put(
    '/ccosto/updatebyid',
    requireAuth,
    requirePermission('data', 'update'),
    validateZod(objectIdSchema),
    validateZod(centroCostoUpdateSchema),
    updateCentroCosto
);

// Eliminar centro de costo
centroCostosRouter.delete(
    '/ccosto/deletebyid',
    requireAuth,
    requirePermission('data', 'delete'),
    validateZod(objectIdSchema),
    deleteCentroCosto
);

export default centroCostosRouter;
