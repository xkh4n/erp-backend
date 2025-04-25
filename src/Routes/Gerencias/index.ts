/* ROUTER */
import { Router } from 'express';
const gerencia = Router();

/* CONTROLLERS */
import { setGerencia } from '../../Controllers/Gerencia';

gerencia.put('/gerencia/nueva', setGerencia);

export default gerencia;