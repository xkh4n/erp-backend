/* ROUTER */
import { Router } from 'express';
const gerencia = Router();

/* CONTROLLERS */
import { setGerencia, getAllGerencia, getGerenciaById, getGerenciaByName, getGerenciaByCodigo, getGerenciaByState, updateGerenciaById, updateGerenciaByCodigo, updateGerenciaByName, updateStateGerenciaById } from '../../Controllers/Gerencia';

/* MIDDLEWARES updatebyname */

/* ROUTES */
gerencia.put('/gerencia/nueva', setGerencia);
gerencia.post('/gerencia/todas', getAllGerencia);
gerencia.post('/gerencia/getbyid', getGerenciaById);
gerencia.post('/gerencia/getbyname', getGerenciaByName);
gerencia.post('/gerencia/getbycodigo', getGerenciaByCodigo);
gerencia.post('/gerencia/getbystate', getGerenciaByState);
gerencia.patch('/gerencia/updatebyid', updateGerenciaById);
gerencia.patch('/gerencia/updatebycodigo', updateGerenciaByCodigo);
gerencia.patch('/gerencia/updatebyname', updateGerenciaByName);
gerencia.patch('/gerencia/estado', updateStateGerenciaById);

export default gerencia;