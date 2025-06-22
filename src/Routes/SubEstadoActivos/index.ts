import { Router } from "express";
const SubEstadosActivosRouter = Router();
import { setSubEstadoActivo, getSubEstadosActivos, getSubEstadoActivoById, getSubEstadoByEstadoActivo, deleteSubEstadoActivo } from "../../Controllers/SubEstadoActivos";

SubEstadosActivosRouter.put('/subestadoactivo/nuevo', setSubEstadoActivo);
SubEstadosActivosRouter.post('/subestadoactivo/todos', getSubEstadosActivos);
SubEstadosActivosRouter.post('/subestadoactivo/byid', getSubEstadoActivoById);
SubEstadosActivosRouter.post('/subestadoactivo/byestado', getSubEstadoByEstadoActivo);
SubEstadosActivosRouter.delete('/subestadoactivo/eliminar', deleteSubEstadoActivo);

export default SubEstadosActivosRouter;