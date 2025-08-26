import express from 'express';
import { Router } from 'express';
const solicitud = Router();

import { createSolicitud, getSoliciudOnly, getAllSolicitudes, getCentroCostoByNroSolicitud, getDetalleBySolicitudIdForRecepcion, getSolicitydAproved, getSolicitudPending, getDetalleBySolicitud, getSolicitudByEstado, aprobarProducto, aprobarSolicitud, rechazarProducto, rechazarSolicitud } from '../../Controllers/Solicitudes/index';
import { requireAuth } from '../../Middlewares/Auth';

/*
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
*/


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
solicitud.post('/solicitud/centro-costo', getCentroCostoByNroSolicitud);

export default solicitud;