import express from 'express';
import { Router } from 'express';
const vistas = Router();

import { setVistas } from '../../Controllers/Views';

vistas.put('/vista/nueva', setVistas);

export default vistas;