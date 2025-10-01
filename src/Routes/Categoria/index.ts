import { Router } from 'express';
const categoria = Router();

/* CONTROLLER */
import { setTipo, getTipos, getTipoById, getLastTipo } from "../../Controllers/Categorias";

/* MIDDLEWARES */
import { conditionalAuth, conditionalPermission } from "../../Library/Security/conditionalAuth";

categoria.put('/categoria/nuevo', conditionalAuth, conditionalPermission('data', 'create'), setTipo);
categoria.post('/categoria/todos', conditionalAuth, conditionalPermission('data', 'read'), getTipos);
categoria.post('/categoria/getbyid', conditionalAuth, conditionalPermission('data', 'read'), getTipoById);
categoria.post('/categoria/last', conditionalAuth, conditionalPermission('data', 'read'), getLastTipo);


export default categoria;
