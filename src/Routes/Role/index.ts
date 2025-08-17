import { Router } from 'express';
import { createRole } from '../../Controllers/Roles';

const role = Router();

role.post('/role/nuevo', createRole);

export default role;
