/* EXPRESS */
import { Router } from 'express';
const centroCostosRouter = Router();

/* CONTROLLER */
import { newCentroCosto, getCentroCostos, getCentroCostoById, updateCentroCosto, deleteCentroCosto } from '../../Controllers/CentroCostos/index';

/* MIDDLEWARES */
import { conditionalAuth, conditionalPermission, conditionalValidation } from '../../Library/Security/conditionalAuth';
import { 
    centroCostoCreateSchema, 
    centroCostoUpdateSchema,
    centroCostoArraySchema,
    objectIdSchema 
} from '../../Library/Validations/zod';

// Crear centro de costo individual
centroCostosRouter.put('/ccosto/nuevo', conditionalValidation(centroCostoCreateSchema), newCentroCosto);

// Crear múltiples centros de costo
centroCostosRouter.put('/ccosto/bulk', conditionalValidation(centroCostoArraySchema), newCentroCosto);

// Obtener todos los centros de costo
centroCostosRouter.post('/ccosto/getall', conditionalAuth, conditionalPermission('data', 'read'), getCentroCostos);

// Obtener centro de costo por ID
centroCostosRouter.post('/ccosto/byid', conditionalAuth, conditionalPermission('data', 'read'), conditionalValidation(objectIdSchema), getCentroCostoById);

// Actualizar centro de costo
centroCostosRouter.put('/ccosto/updatebyid', conditionalAuth, conditionalPermission('data', 'update'), conditionalValidation(objectIdSchema), conditionalValidation(centroCostoUpdateSchema), updateCentroCosto);

// Eliminar centro de costo
centroCostosRouter.delete('/ccosto/deletebyid', conditionalAuth, conditionalPermission('data', 'delete'), conditionalValidation(objectIdSchema), deleteCentroCosto);

export default centroCostosRouter;
