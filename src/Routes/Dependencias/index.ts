import { Router } from "express";
const dependencias = Router();

/* CONTROLLER */
import { setNewDependencia, getAllDependencias } from "../../Controllers/Dependencias";

/* MIDDLEWARES */
import { conditionalAuth, conditionalPermission } from "../../Library/Security/conditionalAuth";

dependencias.put('/dependencia/nueva', conditionalAuth, conditionalPermission('data', 'create'), setNewDependencia);
dependencias.post('/dependencia/todas', conditionalAuth, conditionalPermission('data', 'read'), getAllDependencias);
// dependencias.post('/dependencia/getbyid', conditionalAuth, conditionalPermission('data', 'read'), getDependenciaById);
// dependencias.post('/dependencia/last', conditionalAuth, conditionalPermission('data', 'read'), getLastDependencia);

export default dependencias;


