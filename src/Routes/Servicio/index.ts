
/* ROUTER */
import { Router } from 'express';
const servicio = Router();



/* CONTROLLER */
import { setServicio, getAllServicios, getServicioById, getServicioByCodigo, getServicioByDepartamento, updateServicioById, updateServicioByCodigo } from '../../Controllers/Servicio';

/* ROUTES */
servicio.put('/servicio/nuevo', setServicio);
servicio.post('/servicio/todos', getAllServicios);
servicio.post('/servicio/getbyid', getServicioById);
servicio.post('/servicio/getbycodigo', getServicioByCodigo);
servicio.post('/servicio/getbydepartamento', getServicioByDepartamento);
servicio.patch('/servicio/updatebyid', updateServicioById);
servicio.patch('/servicio/updatebycodigo', updateServicioByCodigo);


export default servicio;