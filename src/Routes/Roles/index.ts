import { Router } from "express";
import { createRole } from '../../Controllers/Roles';
import { validateRole } from '../../Middlewares/Validations';

const roles = Router();

roles.put("/role/create", ...validateRole, createRole);

export default roles;
