import express from 'express';
import { Router } from 'express';
const solicitud = Router();

import { createSolicitud, getSoliciudOnly, getAllSolicitudes, getCentroCostoByNroSolicitud, getDetalleBySolicitudIdForRecepcion, getSolicitydAproved, getSolicitudPending, getDetalleBySolicitud, getSolicitudByEstado, aprobarProducto, aprobarSolicitud, rechazarProducto, rechazarSolicitud } from '../../Controllers/Solicitudes/index';
import { requireAuth } from '../../Middlewares/Auth';

solicitud.put('/solicitud/nueva', requireAuth, createSolicitud);
solicitud.post('/solicitud/solicitud', requireAuth, getSoliciudOnly);
solicitud.post('/solicitud/solicitudes', requireAuth, getAllSolicitudes);
solicitud.post('/solicitud/detalle', requireAuth, getDetalleBySolicitud);
solicitud.patch('/solicitud/item/aprobar', requireAuth, aprobarProducto);
solicitud.patch('/solicitud/aprobar', requireAuth, aprobarSolicitud);
solicitud.patch('/solicitud/item/rechazar', requireAuth, rechazarProducto);
solicitud.patch('/solicitud/rechazar', requireAuth, rechazarSolicitud);
solicitud.post('/solicitud/estado', requireAuth, getSolicitudByEstado);
solicitud.post('/solicitud/aprobadas', requireAuth, getSolicitydAproved);
solicitud.post('/solicitud/pending', requireAuth, getSolicitudPending);
solicitud.post('/solicitud/detalle/recepcion', requireAuth, getDetalleBySolicitudIdForRecepcion);
solicitud.post('/solicitud/centro-costo', requireAuth, getCentroCostoByNroSolicitud);

export default solicitud;