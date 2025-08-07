/* ROUTER */
import { Router } from 'express';
const inventory = Router();

/* CONTROLLERS */
import { agregarInventario, crearInventarioDesdeRecepcion } from '../../Controllers/Inventario/index';

/* MIDDLEWARES */

/* ROUTES */
inventory.put('/inventario/agregar', agregarInventario);

export default inventory;