/* ROUTER */
import { Router } from 'express';
const gerencia = Router();

/* CONTROLLERS */
import { setGerencia, getAllGerencia, getGerenciaById, getGerenciaByCodigo, updateGerenciaById, updateGerenciaByCodigo } from '../../Controllers/Gerencia';

/* MIDDLEWARES */

/* ROUTES */
gerencia.put('/gerencia/nueva', setGerencia);
gerencia.post('/gerencia/todas', getAllGerencia);
gerencia.post('/gerencia/getbyid', getGerenciaById);
gerencia.post('/gerencia/getbycodigo', getGerenciaByCodigo);
gerencia.patch('/gerencia/updatebyid', updateGerenciaById);
gerencia.patch('/gerencia/updatebycodigo', updateGerenciaByCodigo);

export default gerencia;