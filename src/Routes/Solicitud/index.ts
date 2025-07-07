import express from 'express';
import { Router } from 'express';
const solicitud = Router();

import { createSolicitud, getSoliciudOnly, getAllSolicitudes, getDetalleBySolicitud } from '../../Controllers/Solicitudes/index';

solicitud.put('/solicitud/nueva', createSolicitud);
solicitud.post('/solicitud/solicitud', getSoliciudOnly);
solicitud.post('/solicitud/solicitudes', getAllSolicitudes);
solicitud.post('/solicitud/detalle', getDetalleBySolicitud);

export default solicitud;