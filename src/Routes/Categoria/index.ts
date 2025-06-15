const { Router } = require('express');
const categoria = Router();

/* CONTROLLER */
import { setTipo, getTipos, getTipoById } from "../../Controllers/Tipos";

categoria.put('/categoria/nuevo', setTipo);
categoria.post('/categoria/todos', getTipos);
categoria.post('/categoria/getbyid', getTipoById);

export default categoria;
// This file defines the routes for managing "Categorias" in the ERP backend.
