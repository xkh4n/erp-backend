/* ROUTER */
import { Router } from 'express';
const passwordRoutes = Router();

/* CONTROLLER */
import { ChangePassword, ResetPassword } from '../../Controllers/Password/index';

/* MIDDLEWARES */
import { requireAuth } from '../../Middlewares/Auth';
import { validateZod, changePasswordSchema, objectIdSchema } from '../../Library/Validations/zod';

/*
passwordRoutes.post('/change-password', requireAuth, validateZod(changePasswordSchema), ChangePassword);
passwordRoutes.post('/reset-password', requireAuth, validateZod(objectIdSchema), ResetPassword);
*/

passwordRoutes.post('/change-password', ChangePassword);
passwordRoutes.post('/reset-password', ResetPassword);

export default passwordRoutes;
