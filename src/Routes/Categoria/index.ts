const { Router } = require('express');
const categoria = Router();

/* CONTROLLER */
import { setTipo, getTipos, getTipoById, getLastTipo } from "../../Controllers/Categorias";

categoria.put('/categoria/nuevo', setTipo);
categoria.post('/categoria/todos', getTipos);
categoria.post('/categoria/getbyid', getTipoById);
categoria.post('/categoria/last', getLastTipo);

export default categoria;
// This file defines the routes for managing "Categorias" in the ERP backend.
