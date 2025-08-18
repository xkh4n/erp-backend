/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const login = Router();

/* CONTROLLER */
import { Login, RefreshToken, Logout, LogoutAll } from '../../Controllers/Login/index';

/* MIDDLEWARES */
import { requireAuth, optionalAuth } from '../../Middlewares/Auth';
import { validateZod, loginSchema, refreshTokenSchema } from '../../Library/Validations/zod';

login.post('/login', validateZod(loginSchema), Login);
login.post('/refresh', validateZod(refreshTokenSchema), RefreshToken);
login.post('/logout', optionalAuth, Logout);
login.post('/logout-all', requireAuth, LogoutAll);

export default login;