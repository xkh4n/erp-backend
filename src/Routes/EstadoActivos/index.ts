import { Router } from 'express';
const estadoActivo = Router();
import { setEstadoActivo, getEstadoActivo, getEstadoActivoById } from '../../Controllers/EstadoActivos';

estadoActivo.put('/estadoactivo/nuevo', setEstadoActivo);
estadoActivo.post('/estadoactivo/todos', getEstadoActivo);
estadoActivo.post('/estadoactivo/byid', getEstadoActivoById);

export default estadoActivo;