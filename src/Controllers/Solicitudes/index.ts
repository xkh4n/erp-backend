/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Solicitudes Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createValidationError, createNotFoundError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { ISolicitud, ISolicitudPopulated } from "../../Interfaces/Solicitudes/index";
import { IDetalleSolicitud, IDetalleSolicitudPopulated } from "../../Interfaces/Detalles/index";

/* MODELS */
import SolicitudModel from "../../Models/solicitudModel";
import DetalleSolicitudModel from "../../Models/detalleSolicitudModel";
import RecepcionProductoModel from "../../Models/recepcionProductoModel";

/* LIBRARIES */
import { getChileDateTime } from '../../Library/Utils/ManageDate';


/** END-POINT */
import { Request, Response } from 'express';
import { IsEmail, IsId, IsName, IsPhone, IsUsername, IsCodigoSolicitud, IsObjectId } from '../../Library/Validations';

/**
 * @description Controller to create a new Solicitud
 * @param req - Request object
 * @param res - Response object
 */

const createSolicitud = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createValidationError('No se enviaron datos', []);
        }
        const promise: Promise<ISolicitud>[] = [];
        const promiseDetalle: Promise<IDetalleSolicitud>[] = [];
        let state = false;
        //logger.info(`Creando nueva Solicitud con los datos: ${JSON.stringify(req.body)}`);
        const { nroSolicitud, solicitante, cargoSolicitante, beneficiario, gerencia, emailSolicitante, telefonoSolicitante, telefonoBeneficiario, cuentaBeneficiario, observaciones, detalleSolicitud } = req.body;
        /*
         {
            "nroSolicitud":"20250707081922951",
            "solicitante":"OSVALDO ROJAS GONZALEZ",
            "cargoSolicitante":"JEFE DE SOPORTE TI",
            "beneficiario":"TIENDA SANTA ROSA",
            "gerencia":"68653939d8a4d80539557175",
            "emailSolicitante":"osvaldorojasg@gmail.com",
            "telefonoSolicitante":"+56953341785",
            "telefonoBeneficiario":"+56953341785",
            "cuentaBeneficiario":"despacho",
            "observaciones":"ELEMENTOS PARA IMPLEMENTAR CAMBIO DE MODELO DE CAJAS A AUTOSERVICIO EN TIENDA SANTA ROSA.",
            "detalleSolicitud"
        */
        if (!nroSolicitud || !solicitante || !cargoSolicitante || !beneficiario || !gerencia || !emailSolicitante || !telefonoSolicitante || !telefonoBeneficiario || !cuentaBeneficiario || !observaciones) {
            throw createValidationError('Faltan datos obligatorios', []);
        }
        if(!IsName(solicitante) || !IsName(cargoSolicitante) || !IsName(beneficiario)){
            throw createValidationError('Los campos solicitante, cargo solicitante y beneficiario deben ser nombres válidos', [solicitante, cargoSolicitante, beneficiario]);
        }
        if(!IsEmail(emailSolicitante)){
            throw createValidationError('El email del solicitante no es válido', emailSolicitante);
        }
        if(!IsPhone(telefonoSolicitante)){
            throw createValidationError('Los números de teléfono deben ser válidos', telefonoSolicitante);
        }
        if(!IsPhone(telefonoBeneficiario)){
            throw createValidationError('El número de teléfono del beneficiario no es válido', telefonoBeneficiario);
        }
        if(!IsUsername(cuentaBeneficiario)){
            throw createValidationError('La cuenta del beneficiario no es válida', cuentaBeneficiario);
        }
        if(!IsObjectId(gerencia)){
            throw createValidationError('El ID de la gerencia no es válido', gerencia);
        }
        if(!IsCodigoSolicitud(nroSolicitud)){
            throw createValidationError('El número de solicitud no es válido', nroSolicitud);
        }
        if(detalleSolicitud.length === 0){
            throw createValidationError('Debe agregar al menos un ptoducto a la solicitud', []);
        }
        const newSolicitud = new SolicitudModel({
            nroSolicitud: nroSolicitud,
            solicitante: solicitante,
            cargoSolicitante: cargoSolicitante,
            beneficiario: beneficiario,
            gerencia: gerencia,
            emailSolicitante: emailSolicitante,
            telefonoSolicitante: telefonoSolicitante,
            telefonoBeneficiario:telefonoBeneficiario,
            cuentaBeneficiario: cuentaBeneficiario,
            observaciones: observaciones || '',
            estado: 'pendiente',//buscar el id de los estados
            fechaCreacion: getChileDateTime(),
            fechaModificacion: getChileDateTime(),
            fechaAprobacion: null,
            fechaRechazo: null,
            fechaEntrega: null,
            fechaVencimiento: null,
            usuarioCreador: "",
            usuarioModificador: "",
            usuarioAprobador: null,
            usuarioRechazador: null
        })
        for(let i = 0; i < detalleSolicitud.length; i++) {
            const item = detalleSolicitud[i];
            // VALIDATIONS
            if (!item.producto || !item.cantidad || !item.tipoEquipamiento) {
                throw createValidationError('Faltan datos obligatorios en el detalle de la solicitud', []);
            }
            if(!IsObjectId(item.producto)){
                throw createValidationError('El ID del producto no es válido', item.producto);
            }
            if(!IsObjectId(item.tipoEquipamiento)){
                throw createValidationError('El ID del tipo de equipamiento no es válido', item.tipoEquipamiento);
            }
            if(!Number.isInteger(item.cantidad) || item.cantidad <= 0){
                throw createValidationError('La cantidad debe ser un número entero mayor a cero', item.cantidad);
            }
            const newDetalleSolicitud = new DetalleSolicitudModel({
                solicitudId: newSolicitud._id,
                nroSolicitud: nroSolicitud,
                producto: item.producto,
                cantidad: item.cantidad,
                precioEstimado: 0,
                tipoEquipamiento: item.tipoEquipamiento,
                estado: 'pendiente',
                fechaCreacion: getChileDateTime(),
                fechaModificacion: getChileDateTime(),
                cantidadAprobada: 0,
                cantidadEntregada: 0,
                precioReal: 0,
                proveedor: null, // Cambio de '' a null para evitar error de casting
                garantia: null
            });
            try {
                newDetalleSolicitud.save();
                promiseDetalle.push(Promise.resolve(newDetalleSolicitud));
            } catch (error) {
                if(error.code === 11000) {
                    throw createConflictError('Ya existe un detalle de solicitud con ese producto', item.producto);
                }
                if(error.name === 'ValidationError') {
                    throw createValidationError('Error de validación en el detalle de la solicitud', error.message);
                }
                if(error.name === 'MongoError') {
                    throw createServerError('Error de base de datos al guardar el detalle de la solicitud', error.message);
                }
                if(error instanceof CustomError) {
                    throw error;
                } else {
                    throw createServerError('Sucedió un error Inesperado al guardar el detalle de la solicitud', error.message);
                }
            }
        }
        // Save the main Solicitud document
        try {
            await newSolicitud.save();
        } catch (err) {
            if (err.code === 11000) {
                throw createConflictError('Ya existe una Solicitud con ese codigo', nroSolicitud);
            }
            throw createServerError('Sucedió un error Inesperado al guardar la Solicitud', nroSolicitud);
        }
        promise.push(Promise.resolve(newSolicitud));
        const nuevaSolicitud = await Promise.all(promise);
        const nuevosDetalles = await Promise.all(promiseDetalle);
        res.status(201).json({
            codigo: 201,
            data: nuevaSolicitud, nuevosDetalles
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getAllSolicitudes = async (req: Request, res: Response): Promise<void> => {
    try {
        const solicitudes = await SolicitudModel.find()
            .populate('gerencia')
        if (solicitudes.length === 0) {
            throw createNotFoundError('No se encontraron solicitudes', []);
        }
        res.status(200).json({
            codigo: 200,
            data: solicitudes
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getSoliciudOnly = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if (!IsObjectId(id)) {
            throw createValidationError('El ID de la solicitud no es válido', id);
        }
        const solicitud = await SolicitudModel.findById(id).populate('gerencia').populate('usuarioCreador').populate('usuarioModificador').populate('usuarioAprobador').populate('usuarioRechazador');
        if (!solicitud) {
            throw createNotFoundError('Solicitud no encontrada', id);
        }
        res.status(200).json({
            codigo: 200,
            data: solicitud
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getDetalleBySolicitud = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if (!IsObjectId(id)) {
            throw createValidationError('El ID de la solicitud no es válido', id);
        }
        const detalles = await DetalleSolicitudModel.find({ solicitudId: id })
            .populate('producto')
            .populate('tipoEquipamiento')
            .populate('proveedor');
        if (detalles.length === 0) {
            throw createNotFoundError('No se encontraron detalles para esta solicitud', id);
        }
        res.status(200).json({
            codigo: 200,
            data: detalles
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const aprobarSolicitud = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        
        // Validar ID de solicitud
        if (!IsObjectId(id)) {
            throw createValidationError('El ID de la solicitud no es válido', id);
        }
        
        // Buscar la solicitud
        const solicitud = await SolicitudModel.findById(id);
        if (!solicitud) {
            throw createNotFoundError('Solicitud no encontrada', id);
        }
        
        // Verificar que la solicitud esté en estado pendiente
        if (solicitud.estado !== 'pendiente') {
            throw createValidationError('Solo se pueden aprobar solicitudes en estado pendiente', solicitud.estado);
        }
        
        // Actualizar todos los detalles de la solicitud a estado aprobado
        // Primero obtener todos los detalles para actualizar cantidadAprobada si es necesario
        const detalles = await DetalleSolicitudModel.find({ solicitudId: id });
        
        // Actualizar cada detalle
        const updatePromises = detalles.map(async (detalle) => {
            const updateData = {
                estado: 'aprobado',
                fechaModificacion: getChileDateTime(),
                cantidadAprobada: detalle.cantidadAprobada || detalle.cantidad
            };
            
            return DetalleSolicitudModel.findByIdAndUpdate(detalle._id, updateData);
        });
        
        await Promise.all(updatePromises);
        
        // Actualizar la solicitud principal
        solicitud.estado = 'aprobado';
        solicitud.fechaAprobacion = getChileDateTime();
        solicitud.fechaModificacion = getChileDateTime();
        // TODO: Agregar usuario aprobador cuando se implemente autenticación
        // solicitud.usuarioAprobador = req.user.id;
        
        await solicitud.save();
        
        res.status(200).json({
            codigo: 200,
            data: solicitud,
            mensaje: 'Solicitud aprobada exitosamente'
        });
        
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al aprobar la solicitud');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const aprobarProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, cantidadAprobada } = req.body;
        
        // Validar ID del detalle
        if (!IsObjectId(id)) {
            throw createValidationError('El ID del detalle de solicitud no es válido', id);
        }
        
        // Buscar el detalle
        const detalle = await DetalleSolicitudModel.findById(id);
        if (!detalle) {
            throw createNotFoundError('Detalle de solicitud no encontrado', id);
        }
        
        // Validar cantidad aprobada si se proporciona
        if (cantidadAprobada !== undefined) {
            if (!Number.isInteger(cantidadAprobada) || cantidadAprobada <= 0) {
                throw createValidationError('La cantidad aprobada debe ser un número entero mayor a cero', cantidadAprobada);
            }
            if (cantidadAprobada > detalle.cantidad) {
                throw createValidationError('La cantidad aprobada no puede ser mayor a la cantidad solicitada', cantidadAprobada);
            }
            detalle.cantidadAprobada = cantidadAprobada;
        } else {
            // Si no se especifica cantidad, aprobar la cantidad total solicitada
            detalle.cantidadAprobada = detalle.cantidad;
        }
        
        // Actualizar estado del producto
        detalle.estado = 'aprobado';
        detalle.fechaModificacion = getChileDateTime();
        await detalle.save();
        
        // Verificar si la solicitud debe cambiar a estado aprobado
        const solicitud = await SolicitudModel.findById(detalle.solicitudId);
        if (solicitud && solicitud.estado === 'pendiente') {
            // Verificar si hay al menos un producto aprobado
            const productosAprobados = await DetalleSolicitudModel.countDocuments({
                solicitudId: detalle.solicitudId,
                estado: 'aprobado'
            });
            
            if (productosAprobados > 0) {
                solicitud.estado = 'aprobado';
                solicitud.fechaAprobacion = getChileDateTime();
                solicitud.fechaModificacion = getChileDateTime();
                await solicitud.save();
            }
        }
        
        res.status(200).json({
            codigo: 200,
            data: detalle,
            mensaje: 'Producto aprobado exitosamente'
        });
        
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al aprobar el producto');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const rechazarProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, motivoRechazo } = req.body;
        
        // Validar ID del detalle
        if (!IsObjectId(id)) {
            throw createValidationError('El ID del detalle de solicitud no es válido', id);
        }
        
        // Buscar el detalle
        const detalle = await DetalleSolicitudModel.findById(id);
        if (!detalle) {
            throw createNotFoundError('Detalle de solicitud no encontrado', id);
        }
        
        // Actualizar estado del producto
        detalle.estado = 'rechazado';
        detalle.cantidadAprobada = 0; // Al rechazar, cantidad aprobada es 0
        detalle.fechaModificacion = getChileDateTime();
        
        // Si se proporciona motivo de rechazo, agregarlo como observación en el detalle
        if (motivoRechazo) {
            // Asumiendo que existe un campo para observaciones en el detalle, sino se puede agregar
            // detalle.observacionesRechazo = motivoRechazo;
        }
        
        await detalle.save();
        
        // Verificar si todos los productos de la solicitud están rechazados
        const solicitud = await SolicitudModel.findById(detalle.solicitudId);
        if (solicitud) {
            const totalProductos = await DetalleSolicitudModel.countDocuments({
                solicitudId: detalle.solicitudId
            });
            
            const productosRechazados = await DetalleSolicitudModel.countDocuments({
                solicitudId: detalle.solicitudId,
                estado: 'rechazado'
            });
            
            // Si todos los productos están rechazados, rechazar la solicitud completa
            if (totalProductos === productosRechazados) {
                solicitud.estado = 'rechazado';
                solicitud.fechaRechazo = getChileDateTime();
                solicitud.fechaModificacion = getChileDateTime();
                await solicitud.save();
            }
        }
        
        res.status(200).json({
            codigo: 200,
            data: detalle,
            mensaje: 'Producto rechazado exitosamente'
        });
        
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al rechazar el producto');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const rechazarSolicitud = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, motivoRechazo } = req.body;
        
        // Validar ID de solicitud
        if (!IsObjectId(id)) {
            throw createValidationError('El ID de la solicitud no es válido', id);
        }
        
        // Buscar la solicitud
        const solicitud = await SolicitudModel.findById(id);
        if (!solicitud) {
            throw createNotFoundError('Solicitud no encontrada', id);
        }
        
        // Verificar que la solicitud no esté ya procesada completamente
        if (solicitud.estado === 'rechazado') {
            throw createValidationError('La solicitud ya está rechazada', solicitud.estado);
        }
        
        // Actualizar todos los detalles de la solicitud a estado rechazado
        await DetalleSolicitudModel.updateMany(
            { solicitudId: id },
            {
                estado: 'rechazado',
                fechaModificacion: getChileDateTime(),
                cantidadAprobada: 0 // Al rechazar, la cantidad aprobada es 0
            }
        );
        
        // Actualizar la solicitud principal
        solicitud.estado = 'rechazado';
        solicitud.fechaRechazo = getChileDateTime();
        solicitud.fechaModificacion = getChileDateTime();
        
        // Si se proporciona motivo de rechazo, agregarlo a las observaciones
        if (motivoRechazo) {
            solicitud.observaciones = `${solicitud.observaciones}\n\n--- MOTIVO DE RECHAZO ---\n${motivoRechazo}`;
        }
        
        // TODO: Agregar usuario rechazador cuando se implemente autenticación
        // solicitud.usuarioRechazador = req.user.id;
        
        await solicitud.save();
        
        res.status(200).json({
            codigo: 200,
            data: solicitud,
            mensaje: 'Solicitud rechazada exitosamente'
        });
        
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al rechazar la solicitud');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getSolicitudByEstado = async (req: Request, res: Response): Promise<void> => {
    try {
        const { estado } = req.body;
        if (!estado) {
            throw createValidationError('El estado de la solicitud es obligatorio', []);
        }
        const solicitudes = await SolicitudModel.find({ estado: estado })
            .populate('gerencia')
            .populate('usuarioCreador')
            .populate('usuarioModificador')
            .populate('usuarioAprobador')
            .populate('usuarioRechazador');
        if (solicitudes.length === 0) {
            throw createNotFoundError(`No se encontraron solicitudes con el estado ${estado}`, []);
        }
        res.status(200).json({
            codigo: 200,
            data: solicitudes
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getSolicitudPending = async (req: Request, res: Response): Promise<void> => {
    try {
        const solicitudes = await SolicitudModel.find({ estado: 'pendiente' })
            .populate('gerencia')
        if (solicitudes.length === 0) {
            throw createNotFoundError('No hay solicitudes pendientes', []);
        }
        res.status(200).json({
            codigo: 200,
            data: solicitudes
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getSolicitydAproved = async (req: Request, res: Response): Promise<void> => {
    try {
        const solicitudes = await SolicitudModel.find({ estado: 'aprobado' })
            .populate('gerencia')
        if (solicitudes.length === 0) {
            throw createNotFoundError('No hay solicitudes aprobadas', []);
        }
        res.status(200).json({
            codigo: 200,
            data: solicitudes
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getDetalleBySolicitudIdForRecepcion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if (!IsObjectId(id)) {
            throw createValidationError('El ID del detalle de solicitud no es válido', id);
        }
        const detalle = await DetalleSolicitudModel.find({ solicitudId: id })
            .populate('producto')
        if (!detalle || detalle.length === 0) {
            throw createNotFoundError('Detalle de solicitud no encontrado', id);
        }
        
        // Obtener las recepciones ya realizadas para esta solicitud
        const recepciones = await RecepcionProductoModel.find({ solicitudId: id })
            .populate('producto');
        
        // Transformar los datos a la estructura requerida
        const detalleTransformado = await Promise.all(detalle.map(async (item: any) => {
            // Contar recepciones para este producto específico
            const recepcionesProducto = recepciones.filter(r => r.producto._id.toString() === item.producto._id.toString());
            const cantidadRecibida = recepcionesProducto.length;
            const cantidadPendiente = (item.cantidadAprobada || 0) - cantidadRecibida;
            
            return {
                nroSolicitud: item.nroSolicitud,
                producto: item.producto?.nombre || 'Producto no encontrado',
                productoId: item.producto?._id || null,
                cantidad: item.cantidadAprobada || 0,
                cantidadRecibida: cantidadRecibida,
                cantidadPendiente: cantidadPendiente,
                recepciones: recepcionesProducto.map(r => ({
                    numeroSerie: r.numeroSerie,
                    codigoInventario: r.codigoInventario,
                    fechaRecepcion: r.fechaRecepcion
                }))
            };
        }));
        
        res.status(200).json({
            codigo: 200,
            data: detalleTransformado
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

/**
 * @description Controller to process product reception
 * @param req - Request object
 * @param res - Response object
 */
const procesarRecepcionProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { solicitudId, producto, numeroSerie, esSolicitudCompleta } = req.body;
        
        if (!solicitudId || !producto || !numeroSerie) {
            throw createValidationError('Faltan datos obligatorios para la recepción (solicitudId, producto, numeroSerie)', []);
        }

        if (!IsObjectId(solicitudId)) {
            throw createValidationError('El ID de la solicitud no es válido', solicitudId);
        }

        if (!IsObjectId(producto)) {
            throw createValidationError('El ID del producto no es válido', producto);
        }

        // Buscar el detalle de la solicitud específico
        const detalleToUpdate = await DetalleSolicitudModel.findOne({
            solicitudId: solicitudId,
            producto: producto
        });

        if (!detalleToUpdate) {
            throw createNotFoundError('No se encontró el detalle de la solicitud especificado');
        }

        // Verificar que el número de serie no esté ya en uso
        const existingWithSerie = await RecepcionProductoModel.findOne({
            numeroSerie: numeroSerie.toUpperCase()
        });
        if (existingWithSerie) {
            throw createConflictError('El número de serie ya está registrado en otro producto');
        }

        // Contar cuántas recepciones ya existen para este producto
        const recepcionesExistentes = await RecepcionProductoModel.countDocuments({
            solicitudId: solicitudId,
            producto: producto
        });

        // Verificar que no se exceda la cantidad aprobada
        if (recepcionesExistentes >= (detalleToUpdate.cantidadAprobada || 0)) {
            throw createValidationError('Ya se han recibido todas las unidades aprobadas para este producto');
        }

        // Generar código de inventario autoincremental
        const ultimaRecepcion = await RecepcionProductoModel.findOne({})
            .sort({ codigoInventario: -1 })
            .select('codigoInventario')
            .lean();
        
        let nuevoCodigo: number;
        
        if (ultimaRecepcion && ultimaRecepcion.codigoInventario) {
            // Incrementar desde el último código
            nuevoCodigo = ultimaRecepcion.codigoInventario + 1;
        } else {
            // Primer código si no existe ninguno
            nuevoCodigo = 100000000;
        }
        
        // Verificar que no exceda el máximo
        if (nuevoCodigo > 999999999) {
            throw createValidationError('Se ha alcanzado el límite máximo de códigos de inventario');
        }

        // Crear nueva recepción con código de inventario generado
        const nuevaRecepcion = new RecepcionProductoModel({
            solicitudId: solicitudId,
            detalleSolicitudId: detalleToUpdate._id,
            nroSolicitud: detalleToUpdate.nroSolicitud,
            producto: producto,
            numeroSerie: numeroSerie.toUpperCase(),
            codigoInventario: nuevoCodigo, // Asignar el código generado
            fechaRecepcion: getChileDateTime(),
            fechaCreacion: getChileDateTime(),
            fechaModificacion: getChileDateTime()
        });

        const recepcionGuardada = await nuevaRecepcion.save();

        // Actualizar la cantidad entregada en el detalle de solicitud
        const nuevaCantidadEntregada = recepcionesExistentes + 1;
        const actualizacionDetalle: any = {
            cantidadEntregada: nuevaCantidadEntregada,
            fechaModificacion: getChileDateTime()
        };

        // Si se ha entregado todo lo aprobado, cambiar el estado
        if (nuevaCantidadEntregada >= (detalleToUpdate.cantidadAprobada || 0)) {
            actualizacionDetalle.estado = 'entregado';
            actualizacionDetalle.fechaEntrega = getChileDateTime();
        }

        await DetalleSolicitudModel.findByIdAndUpdate(
            detalleToUpdate._id,
            actualizacionDetalle,
            { new: true, runValidators: true }
        );

        // Verificar si todos los productos de la solicitud han sido completamente recibidos
        // basándose en la información del frontend
        if (esSolicitudCompleta === true) {
            await SolicitudModel.findByIdAndUpdate(
                solicitudId,
                {
                    estado: 'recibido',
                    fechaModificacion: getChileDateTime()
                },
                { new: true, runValidators: true }
            );
            logger.info(`Solicitud ${detalleToUpdate.nroSolicitud} completamente recibida - Estado actualizado a 'recibido'`);
        }

        logger.info(`Producto recibido exitosamente: ${producto} - Serie: ${numeroSerie} - Código inventario: ${recepcionGuardada.codigoInventario}`);

        res.status(200).json({
            codigo: 200,
            mensaje: 'Producto recibido exitosamente',
            data: {
                _id: recepcionGuardada._id,
                numeroSerie: recepcionGuardada.numeroSerie,
                codigoInventario: recepcionGuardada.codigoInventario,
                fechaRecepcion: recepcionGuardada.fechaRecepcion,
                cantidadEntregada: nuevaCantidadEntregada,
                cantidadPendiente: (detalleToUpdate.cantidadAprobada || 0) - nuevaCantidadEntregada,
                solicitudCompleta: esSolicitudCompleta === true
            }
        });

    } catch (error) {
        if (error instanceof CustomError) {
            logger.error(`Error en procesarRecepcionProducto: ${error.message}`);
            res.status(error.code).json(error.toJSON());
        } else {
            logger.error(`Error inesperado en procesarRecepcionProducto: ${error}`);
            res.status(500).json({
                codigo: 500,
                mensaje: 'Error interno del servidor',
                detalle: 'Error inesperado al procesar la recepción del producto'
            });
        }
    }
};

export {
    createSolicitud,
    getSoliciudOnly,
    getAllSolicitudes,
    getDetalleBySolicitudIdForRecepcion,
    procesarRecepcionProducto,
    getSolicitydAproved,
    getSolicitudPending,
    getDetalleBySolicitud,
    getSolicitudByEstado,
    aprobarProducto,
    aprobarSolicitud,
    rechazarProducto,
    rechazarSolicitud
};