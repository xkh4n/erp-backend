/* ROUTER */
import { Router } from 'express';
const passwordRoutes = Router();

/* CONTROLLER */
import { ChangePassword, ResetPassword } from '../../Controllers/Password/index';

/* MIDDLEWARES */
import { conditionalAuth, conditionalValidation } from '../../Library/Security/conditionalAuth';
import { changePasswordSchema, objectIdSchema } from '../../Library/Validations/zod';

passwordRoutes.post('/change-password', conditionalAuth, conditionalValidation(changePasswordSchema), ChangePassword);
passwordRoutes.post('/reset-password', conditionalAuth, conditionalValidation(objectIdSchema), ResetPassword);

export default passwordRoutes;
