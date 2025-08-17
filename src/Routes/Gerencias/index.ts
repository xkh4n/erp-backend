/* ROUTER */
import { Router } from 'express';
const gerencia = Router();

/* CONTROLLERS */
import { setGerencia, getAllGerencia, getGerenciaById, getGerenciaByName, getGerenciaByCodigo, getGerenciaByState, updateGerenciaById, updateGerenciaByCodigo, updateGerenciaByName, updateStateGerenciaById } from '../../Controllers/Gerencia';

/* MIDDLEWARES */
import { 
  validateGerencia, 
  validateObjectIdInBody, 
  validateGerenciaCodigo, 
  validateGerenciaName 
} from '../../Middlewares/Validations';

/* ROUTES */
gerencia.put('/gerencia/nueva', validateGerencia, setGerencia);
gerencia.post('/gerencia/todas', getAllGerencia);
gerencia.post('/gerencia/getbyid', validateObjectIdInBody, getGerenciaById);
gerencia.post('/gerencia/getbyname', validateGerenciaName, getGerenciaByName);
gerencia.post('/gerencia/getbycodigo', validateGerenciaCodigo, getGerenciaByCodigo);
gerencia.post('/gerencia/getbystate', getGerenciaByState);
gerencia.patch('/gerencia/updatebyid', validateObjectIdInBody, updateGerenciaById);
gerencia.patch('/gerencia/updatebycodigo', validateGerenciaCodigo, updateGerenciaByCodigo);
gerencia.patch('/gerencia/updatebyname', validateGerenciaName, updateGerenciaByName);
gerencia.patch('/gerencia/estado', validateObjectIdInBody, updateStateGerenciaById);


export default gerencia;