import { Router } from 'express';

const proceso = Router();

/* CONTROLLER */
import { setProceso, getAllProceso, getProcesoById, getProcesoByCodigo, getProcesoByServicio, updateProcesoById, updateProcesoByCodigo, getProcesoByIdServicio, deleteProcesoById } from '../../Controllers/Proceso';


/* ROUTES */
proceso.put('/procesos/nuevo', setProceso);
proceso.post('/procesos/todos', getAllProceso);
proceso.post('/procesos/getbyid', getProcesoById);
proceso.post('/procesos/getbycodigo', getProcesoByCodigo);
proceso.post('/procesos/getbyservicio', getProcesoByServicio);
proceso.patch('/procesos/updatebyid', updateProcesoById);
proceso.patch('/procesos/updatebycodigo', updateProcesoByCodigo);
proceso.post('/procesos/getbyidservicio', getProcesoByIdServicio);
proceso.delete('/procesos/deletebyid', deleteProcesoById);

export default proceso;