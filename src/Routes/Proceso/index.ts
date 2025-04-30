import { Router } from 'express';

const proceso = Router();

/* CONTROLLER */
import { setProceso, getAllProceso, getProcesoById, getProcesoByCodigo, getProcesoByServicio, updateProcesoById, updateProcesoByCodigo } from '../../Controllers/Proceso';


/* ROUTES */
proceso.put('/proceso/nuevo', setProceso);
proceso.post('/proceso/todos', getAllProceso);
proceso.post('/proceso/getbyid', getProcesoById);
proceso.post('/proceso/getbycodigo', getProcesoByCodigo);
proceso.post('/proceso/getbyservicio', getProcesoByServicio);
proceso.patch('/proceso/updatebyid', updateProcesoById);
proceso.patch('/proceso/updatebycodigo', updateProcesoByCodigo);

export default proceso;