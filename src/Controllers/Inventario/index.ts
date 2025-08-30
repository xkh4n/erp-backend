/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Inventario Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createValidationError, createNotFoundError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { IInventory } from '../../Interfaces/Inventario';

/* MODELS */
import Inventario from '../../Models/inventarioModel';
import Gerencia from '../../Models/gerenciaModel';
import CentroCosto from '../../Models/centrocostosModel';
import SubEstadosActivos from '../../Models/subEstadosActivosModel';
import Producto from '../../Models/productoModel';

/* LIBRARIES */
import { getChileDateTime } from '../../Library/Utils/ManageDate';
import { Request, Response, NextFunction } from "express";
import { IsId, IsParagraph } from '../../Library/Validations';

/**
 * @description Crea un nuevo inventario
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */

const agregarInventario = async (req: Request, res: Response): Promise<void> => {
    const { 
        productoId, 
        numeroSerie, 
        centroCosto, 
        modelo, 
        precio,
        nroSolicitud,
        proveedorId,
        tipoDocumento,
        numeroDocumento
    } = req.body;

    const inventarioGuardado = await guardarInventario(
        productoId, 
        numeroSerie, 
        centroCosto, 
        modelo, 
        precio,
        nroSolicitud,
        proveedorId,
        tipoDocumento,
        numeroDocumento
    );
    res.status(201).json({
        codigo: 201,
        mensaje: 'Inventario creado exitosamente',
        data: inventarioGuardado
    });
}

/**
 * @description Función auxiliar para crear inventario desde recepción de productos
 * @param {string} productoId - ID del producto
 * @param {string} numeroSerie - Número de serie del producto
 * @param {string} gerencia - ID de la gerencia
 * @param {string} modelo - Modelo del producto
 * @param {number} precio - Precio del producto
 * @param {string} nroSolicitud - Número de solicitud
 * @param {string} proveedorId - ID del proveedor
 * @param {string} tipoDocumento - Tipo de documento
 * @param {string} numeroDocumento - Número de documento
 * @returns {Promise<Object>} - Retorna el inventario creado
 */
const crearInventarioDesdeRecepcion = async (
    productoId: string, 
    numeroSerie: string, 
    centroCosto: string, 
    modelo: string, 
    precio: number,
    nroSolicitud?: string,
    proveedorId?: string,
    tipoDocumento?: string,
    numeroDocumento?: string
): Promise<any> => {
    // Validaciones
    const inventarioGuardado = await guardarInventario(
        productoId, 
        numeroSerie, 
        centroCosto, 
        modelo, 
        precio,
        nroSolicitud,
        proveedorId,
        tipoDocumento,
        numeroDocumento
    );
    return inventarioGuardado;
};

const guardarInventario = async (
    productoId: string, 
    numeroSerie: string, 
    centroCosto: string, 
    modelo: string, 
    precio: number,
    nroSolicitud?: string,
    proveedorId?: string,
    tipoDocumento?: string,
    numeroDocumento?: string
) => {
    // Validaciones
    if (!IsId(productoId)) {
        throw createValidationError('El ID del producto es inválido', 'Producto: ' + productoId);
    }
    if (!IsParagraph(numeroSerie)) {
        throw createValidationError('El número de serie debe tener entre 3 y 50 caracteres', 'Serie: ' + numeroSerie);
    }
    if (!IsId(centroCosto)) {
        throw createValidationError('El ID del centro de costo es inválido', 'Centro de Costo: ' + centroCosto);
    }
    if(!IsParagraph(modelo)) {
        throw createValidationError('El modelo debe tener entre 3 y 50 caracteres', 'Modelo: ' + modelo);
    }
    const subEstados = await SubEstadosActivos.findOne({ nombre: 'DISPONIBLE' });
    if (!subEstados) {
        throw createNotFoundError('No existe un estado activo con el código "DISPONIBLE"');
    }
    const centrosCosto = await CentroCosto.findById(centroCosto);
    if (!centrosCosto) {
        throw createNotFoundError('No existe un centro de costo con ese ID', 'Centro de Costo: ' + centroCosto);
    }
    const productos = await Producto.findById(productoId);
    if (!productos) {
        throw createNotFoundError('No existe un producto con ese ID', 'Producto: ' + productoId);
    }
    /*
        Generacion del código de inventario
        El código de inventario es un número único que se genera automáticamente.
        IMP + AÑO (AA) + MES (MM) + DIA (DD) + HORA (HH) + MINUTO (MM) + SEGUNDO (SS) + MILISEGUNDO (MMM)
        Formato: IMPAAMMDDHHMMSSMMM
        Ejemplo: IMP25071456301234
        
        La unicidad se garantiza por el timestamp completo hasta milisegundos.
    */
    const fechaActual = getChileDateTime();
    
    const año = fechaActual.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minuto = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundo = fechaActual.getSeconds().toString().padStart(2, '0');
    const milisegundo = fechaActual.getMilliseconds().toString().padStart(3, '0');
    
    const codigoInventario = `IMP${año}${mes}${dia}${hora}${minuto}${segundo}${milisegundo}`;

    const inventarioGuardado = new Inventario({
        inventoryCode: codigoInventario,
        producto: productos._id,
        modelo: modelo,
        serialNumber: numeroSerie.toUpperCase(),
        status: subEstados._id,
        centroCosto: centrosCosto._id,
        // Campos de recepción
        nroSolicitud: nroSolicitud,
        proveedor: proveedorId,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento?.toUpperCase(),
        assignedUser: null, // Asignado a null inicialmente
        validityValue: null, // Sin vigencia inicial
        validityType: null, // Sin tipo de vigencia inicial
        expirationDate: null, // Sin fecha de expiración inicial
        value: precio, // Sin valor inicial
        location: null, // Sin ubicación inicial
        createdAt: getChileDateTime(),
        updatedAt: getChileDateTime(),
        createdBy: null, // Asignado a null inicialmente
        updatedBy: null, // Asignado a null inicialmente
        isActive: true, // Activo por defecto
        isDeleted: false, // No eliminado por defecto
        deletedAt: null, // Sin fecha de eliminación inicial
        deletedBy: null // Sin usuario de eliminación inicial
    });
    try {
        await inventarioGuardado.save();
    } catch (error) {
        if(error.code === 11000) {
            throw createConflictError('Ya existe ese producto', inventarioGuardado.serialNumber);
        }
        if(error.name === 'ValidationError') {
            throw createValidationError('Error de validación en el Inventario', error.message);
        }
        if(error.name === 'MongoError') {
            throw createServerError('Error de base de datos al guardar el Producto en el Inventario', error.message);
        }
        if(error instanceof CustomError) {
            throw error;
        } else {
            throw createServerError('Sucedió un error Inesperado al guardar el Inventario', error.message);
        }
    }
    return inventarioGuardado;
}



export {
    agregarInventario,
    crearInventarioDesdeRecepcion,
}