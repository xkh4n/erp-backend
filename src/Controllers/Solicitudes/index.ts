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

export {
    createSolicitud,
    getSoliciudOnly,
    getAllSolicitudes,
    getDetalleBySolicitud
}