import { Router } from "express";
import { createPermission, getPermissionsId, getPermissionById, getAllPermissions, getAllPairPermissions } from '../../Controllers/Permissions';
import { validateCommonFields, validatePermissionNames, validatePermissionById } from '../../Middlewares/Validations';

const permisos = Router();

/*
permisos.put("/permission/create", ...validateCommonFields, createPermission);
permisos.post("/permission/ids", ...validatePermissionNames, getPermissionsId);
permisos.post("/permission/byid", ...validatePermissionById, getPermissionById);
*/

permisos.put("/permission/create", createPermission);
permisos.post("/permission/ids", getPermissionsId);
permisos.post("/permission/byid", getPermissionById);
permisos.post("/permissions/all", getAllPermissions);
permisos.post("/permissions/pairs", getAllPairPermissions);


export default permisos;