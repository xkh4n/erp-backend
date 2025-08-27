import {Router} from 'express';

/* CONTROLLERS */
import {getAllUsers, getUserById, getUserByUsername} from '../../Controllers/Users/index';

/* MIDDLEWARES */
import { conditionalAuth, conditionalPermission } from '../../Library/Security/conditionalAuth';

const usuarios = Router();

usuarios.post('/users/all', conditionalAuth, conditionalPermission('admin','read'), getAllUsers);
usuarios.post('/users/byid', conditionalAuth, conditionalPermission('admin','read'), getUserById);
usuarios.post('/users/byusername', conditionalAuth, conditionalPermission('admin','read'), getUserByUsername);

export default usuarios;