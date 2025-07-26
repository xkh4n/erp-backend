import express from 'express';
import { Router } from 'express';
const solicitud = Router();

import { createSolicitud, getSoliciudOnly, getAllSolicitudes, getDetalleBySolicitudIdForRecepcion, procesarRecepcionProducto, getSolicitydAproved, getSolicitudPending, getDetalleBySolicitud, getSolicitudByEstado, aprobarProducto, aprobarSolicitud, rechazarProducto, rechazarSolicitud } from '../../Controllers/Solicitudes/index';

solicitud.put('/solicitud/nueva', createSolicitud);
solicitud.post('/solicitud/solicitud', getSoliciudOnly);
solicitud.post('/solicitud/solicitudes', getAllSolicitudes);
solicitud.post('/solicitud/detalle', getDetalleBySolicitud);
solicitud.patch('/solicitud/item/aprobar', aprobarProducto);
solicitud.patch('/solicitud/aprobar', aprobarSolicitud);
solicitud.patch('/solicitud/item/rechazar', rechazarProducto);
solicitud.patch('/solicitud/rechazar', rechazarSolicitud);
solicitud.post('/solicitud/estado', getSolicitudByEstado);
solicitud.post('/solicitud/aprobadas', getSolicitydAproved);
solicitud.post('/solicitud/pending', getSolicitudPending);
solicitud.post('/solicitud/detalle/recepcion', getDetalleBySolicitudIdForRecepcion);
solicitud.post('/solicitud/recepcion/procesar', procesarRecepcionProducto);

export default solicitud;