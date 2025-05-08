import express from 'express';
import { Router } from 'express';
const vistas = Router();

import { setVistas, crearVistas, getVistas } from '../../Controllers/Views';

vistas.put('/vista/nueva', crearVistas);
vistas.post('/vista/listado', getVistas);

export default vistas;