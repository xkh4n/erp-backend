import {Router} from 'express';

/* CONTROLLERS */
import {getAllUsers, getUserById, getUserByUsername} from '../../Controllers/Users/index';

/* MIDDLEWARES */
import { requireAuth, requirePermission } from '../../Middlewares/Auth';

const usuarios = Router();

/*
usuarios.post('/users/all', getAllUsers);
usuarios.post('/users/byid', getUserById);
usuarios.post('/users/byusername', getUserByUsername);
*/

usuarios.post('/users/all', requireAuth, requirePermission('admin','read'), getAllUsers);
usuarios.post('/users/byid', requireAuth, requirePermission('admin','read'), getUserById);
usuarios.post('/users/byusername', requireAuth, requirePermission('admin','read'), getUserByUsername);

export default usuarios;