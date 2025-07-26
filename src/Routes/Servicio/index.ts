
/* ROUTER */
import { Router } from 'express';
const servicio = Router();



/* CONTROLLER */
import { setServicio, getAllServicios, getServicioById, getServicioByCodigo, getServicioByDeptoCode, updateServicioById, updateServicioByCodigo } from '../../Controllers/Servicio';

/* ROUTES */
servicio.put('/servicios/nuevo', setServicio);
servicio.post('/servicios/todos', getAllServicios);
servicio.post('/servicios/getbyid', getServicioById);
servicio.post('/servicios/getbycodigo', getServicioByCodigo);
servicio.post('/servicios/getbydeptocodigo', getServicioByDeptoCode);
servicio.patch('/servicios/updatebyid', updateServicioById);
servicio.patch('/servicios/updatebycodigo', updateServicioByCodigo);



export default servicio;