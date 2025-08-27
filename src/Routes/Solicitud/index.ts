import express from 'express';
import { Router } from 'express';
const solicitud = Router();

import { createSolicitud, getSoliciudOnly, getAllSolicitudes, getCentroCostoByNroSolicitud, getDetalleBySolicitudIdForRecepcion, getSolicitydAproved, getSolicitudPending, getDetalleBySolicitud, getSolicitudByEstado, aprobarProducto, aprobarSolicitud, rechazarProducto, rechazarSolicitud } from '../../Controllers/Solicitudes/index';
import { conditionalAuth } from '../../Library/Security/conditionalAuth';

solicitud.put('/solicitud/nueva', conditionalAuth, createSolicitud);
solicitud.post('/solicitud/solicitud', conditionalAuth, getSoliciudOnly);
solicitud.post('/solicitud/solicitudes', conditionalAuth, getAllSolicitudes);
solicitud.post('/solicitud/detalle', conditionalAuth, getDetalleBySolicitud);
solicitud.patch('/solicitud/item/aprobar', conditionalAuth, aprobarProducto);
solicitud.patch('/solicitud/aprobar', conditionalAuth, aprobarSolicitud);
solicitud.patch('/solicitud/item/rechazar', conditionalAuth, rechazarProducto);
solicitud.patch('/solicitud/rechazar', conditionalAuth, rechazarSolicitud);
solicitud.post('/solicitud/estado', conditionalAuth, getSolicitudByEstado);
solicitud.post('/solicitud/aprobadas', conditionalAuth, getSolicitydAproved);
solicitud.post('/solicitud/pending', conditionalAuth, getSolicitudPending);
solicitud.post('/solicitud/detalle/recepcion', conditionalAuth, getDetalleBySolicitudIdForRecepcion);
solicitud.post('/solicitud/centro-costo', conditionalAuth, getCentroCostoByNroSolicitud);

export default solicitud;