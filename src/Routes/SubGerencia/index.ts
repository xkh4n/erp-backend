import express from 'express';
import { Router } from 'express';
const subgerencia = Router();

/* CONTROLLER */
import { setSubGerencia, getAllSubGerencia, getSubGerenciaById, getSubGerenciaByCodigo, getSubGciaByEstado, getSubGerenciaByIdGerencia, getSubGerenciaByCodigoGerencia, updateSubGerenciaById, updateSubGerenciaByCodigo } from '../../Controllers/SubGerencia';


subgerencia.put('/subgerencia/nueva', setSubGerencia);
subgerencia.post('/subgerencia/todas', getAllSubGerencia);
subgerencia.post('/subgerencia/porid', getSubGerenciaById);
subgerencia.post('/subgerencia/porcodigo', getSubGerenciaByCodigo);
subgerencia.post('/subgerencia/poridgerencia', getSubGerenciaByIdGerencia);
subgerencia.post('/subgerencia/porcodigogerencia', getSubGerenciaByCodigoGerencia);
subgerencia.patch('/subgerencia/actualizarporid', updateSubGerenciaById);
subgerencia.patch('/subgerencia/actualizarporcodigo', updateSubGerenciaByCodigo);
subgerencia.post('/subgerencia/estado', getSubGciaByEstado);

export default subgerencia;