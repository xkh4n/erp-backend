import { Router } from 'express';

const depto = Router();

import { setDepartamento, getAllDepartamentos, getDepartamentoById, getDepartamentoByIdSubGerencia, getDepartamentoByCodigo, getDepartamentoByCodigoSubGerencia, updateDepartamentoById, updateDepartamentoByCodigo } from '../../Controllers/Departamento';

/* ROUTES */
depto.put('/depto/nuevo', setDepartamento);
depto.post('/depto/todos', getAllDepartamentos);
depto.post('/depto/getbyid', getDepartamentoById);
depto.post('/depto/getbyidsubgerencia', getDepartamentoByIdSubGerencia);
depto.post('/depto/getbycodigo', getDepartamentoByCodigo);
depto.post('/depto/getbycodigosubgerencia', getDepartamentoByCodigoSubGerencia);
depto.patch('/depto/updatebyid', updateDepartamentoById);
depto.patch('/depto/updatebycodigo', updateDepartamentoByCodigo);


export default depto;