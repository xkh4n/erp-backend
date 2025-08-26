import { Router } from 'express';
import { createRole, getAllRoles, getRoleById, getRoleByRole, updateRoleStatus } from '../../Controllers/Roles';
import { validateRole, validateRoleById, validateRoleName } from '../../Middlewares/Validations';

const role = Router();

/*
role.post('/role/nuevo', ...validateRole, createRole);
role.post('/role/all', getAllRoles);
role.post('/role/byid', ...validateRoleById, getRoleById);
role.post('/role/byname', ...validateRoleName, getRoleByRole);
role.patch('/role/updatestatus', ...validateRoleById, updateRoleStatus);
*/

role.post('/role/nuevo', createRole);
role.post('/role/all', getAllRoles);
role.post('/role/byid', getRoleById);
role.post('/role/byname', getRoleByRole);
role.patch('/role/updatestatus', updateRoleStatus);

export default role;
