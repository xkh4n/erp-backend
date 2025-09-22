/* ROUTER */
import { Router } from 'express';
const kardex = Router();

/* CONTROLLERS */
import { setKardex } from '../../Controllers/Kardex';

/* MIDDLEWARES */


/* ROUTES */
kardex.put('/kardex/registrar', setKardex);

export default kardex;