/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const login = Router();

/* CONTROLLER */
import { Login, RefreshToken, Logout, LogoutAll } from '../../Controllers/Login/index';

/* MIDDLEWARES */
import { conditionalAuth, conditionalOptionalAuth, conditionalValidation } from '../../Library/Security/conditionalAuth';
import { loginSchema, refreshTokenSchema } from '../../Library/Validations/zod';

login.post('/login', conditionalValidation(loginSchema), Login);
login.post('/refresh', conditionalValidation(refreshTokenSchema), RefreshToken);
login.post('/logout', conditionalOptionalAuth, Logout);
login.post('/logout-all', conditionalAuth, LogoutAll);


export default login;