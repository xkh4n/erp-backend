/* ROUTER */
import { Router } from 'express';
const inventory = Router();

/* CONTROLLERS */
import { agregarInventario, filtrarInventaro, obtenerEstadisticasInventario, obtenerEstadisticasPorUbicacion } from '../../Controllers/Inventario/index';

/* MIDDLEWARES */

/* ROUTES */
inventory.put('/inventario/agregar', agregarInventario);
inventory.post('/inventario/filtrar', filtrarInventaro);
inventory.get('/inventario/estadisticas', obtenerEstadisticasInventario);
inventory.get('/inventario/estadisticas/ubicacion', obtenerEstadisticasPorUbicacion);

export default inventory;