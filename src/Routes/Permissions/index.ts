import { Router } from "express";
import { createPermission, getPermissionsId, getPermissionById } from '../../Controllers/Permissions';
import { validateCommonFields, validatePermissionNames, validatePermissionById } from '../../Middlewares/Validations';

const permisos = Router();

permisos.put("/permission/create", ...validateCommonFields, createPermission);
permisos.post("/permission/ids", ...validatePermissionNames, getPermissionsId);
permisos.post("/permission/byid", ...validatePermissionById, getPermissionById);


export default permisos;