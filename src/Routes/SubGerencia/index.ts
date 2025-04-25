import express from 'express';
import { Router } from 'express';
const subgerencia = Router();

/* CONTROLLER */
import { setSubGerencia } from '../../Controllers/SubGerencia';


subgerencia.put('/subgerencia/nueva', setSubGerencia);

export default subgerencia;