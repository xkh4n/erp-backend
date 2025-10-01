import { Router } from "express";
const acceso = Router();

/* CONTROLLER */
import { createAccesoSala, getAccesosPendientes, updateAccesoSala } from "../../Controllers/AccesoSala";

/* MIDDLEWARES */
import { conditionalAuth, conditionalPermission } from "../../Library/Security/conditionalAuth";

acceso.put('/acceso/nuevo', conditionalAuth, conditionalPermission('data', 'create'), createAccesoSala);
acceso.post('/acceso/pendientes', conditionalAuth, conditionalPermission('data', 'read'), getAccesosPendientes);
acceso.patch('/acceso/actualizar', conditionalAuth, conditionalPermission('data', 'update'), updateAccesoSala);
// acceso.post('/acceso/todas', conditionalAuth, conditionalPermission('data', 'read'), getAccesosSalas);
// acceso.post('/acceso/getbyid', conditionalAuth, conditionalPermission('data', 'read'), getAccesoSalaById);
// acceso.post('/acceso/last', conditionalAuth, conditionalPermission('data', 'read'), getLastAccesoSala);

export default acceso;
