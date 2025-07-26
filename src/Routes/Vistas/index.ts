import express from 'express';
import { Router } from 'express';
const vistas = Router();

import { setVistas, crearVistas, getVistas, deleteVistas } from '../../Controllers/Views';

vistas.put('/vista/nueva', crearVistas);
vistas.post('/vista/listado', getVistas);
vistas.delete('/vista/eliminar', deleteVistas);

export default vistas;