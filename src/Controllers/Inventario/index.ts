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
import CentroCostos from '../../Models/centrocostosModel';
import SubEstadosActivos from '../../Models/subEstadosActivosModel';
import Producto from '../../Models/productoModel';
import Tipos from '../../Models/categoriasModel';

/* LIBRARIES */
import { getChileDateTime } from '../../Library/Utils/ManageDate';
import { Request, Response, NextFunction } from "express";
import { IsId, IsParagraph } from '../../Library/Validations';
import mongoose from 'mongoose';

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
    const centrosCosto = await CentroCostos.findById(centroCosto);
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

/**
 * @description Filtra el inventario por uno o más campos opcionales: producto, serie, centro de costo, proveedor, usuario o todos
 * @route POST /api/inventario/filtrar
 * @body { productoId?, numeroSerie?, centroCosto?, proveedorId?, usuarioId?, page?, limit? }
 */
const filtrarInventaro = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {
            productoId,
            numeroSerie,
            centroCosto,
            proveedorId,
            usuarioId,
            categoriaId,
            todos,
            page,
            limit
        } = req.body;
        
        // Parámetros de paginación
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 10;
        const skip = (currentPage - 1) * itemsPerPage;
        logger.warn('Datos recibidos:', req.body);
        logger.warn('categoriaId:', categoriaId, 'todos:', todos);
        
        let inventarioFiltrado;

        // Si necesitamos filtrar por categoría, usamos agregación
        if (!todos && categoriaId) {
            logger.warn('Entrando en filtro por categoría');
            logger.warn('categoriaId recibido:', categoriaId);
            
            // Validar que la categoría existe
            const categoria = await Tipos.findById(categoriaId);
            if (!categoria) {
                throw createNotFoundError('No existe una categoría con ese ID', 'Categoría: ' + categoriaId);
            }
            
            logger.warn('Categoría encontrada:', categoria.nombre);

            // Versión simplificada para debug - primero obtener productos de la categoría
            const productosDeCategoria = await Producto.find({ categoria: categoria._id });
            logger.warn('Productos de la categoría encontrados:', productosDeCategoria.length);
            
            if (productosDeCategoria.length === 0) {
                // No hay productos de esta categoría
                inventarioFiltrado = {
                    data: [],
                    total: 0,
                    totalPages: 0,
                    currentPage,
                    hasNext: false,
                    hasPrev: false
                };
            } else {
                // Filtrar inventario por estos productos
                const productosIds = productosDeCategoria.map(p => p._id);
                const filtro: any = { producto: { $in: productosIds } };
                
                // Agregar otros filtros si existen
                if (productoId) filtro.producto = productoId;
                if (numeroSerie) filtro.serialNumber = { $regex: numeroSerie, $options: 'i' };
                if (proveedorId) filtro.proveedor = proveedorId;
                if (usuarioId) filtro.assignedUser = usuarioId;
                
                // Agregar filtro de centro de costo si se especifica
                if (centroCosto) {
                    const ccosto = await CentroCostos.findById(centroCosto);
                    if (!ccosto) {
                        throw createNotFoundError('No existe un centro de costo con ese ID', 'Centro de Costo: ' + centroCosto);
                    }
                    filtro.location = ccosto.codigo.toString();
                }
                
                logger.warn('Filtro aplicado:', filtro);
                
                // Contar total de registros
                const total = await Inventario.countDocuments(filtro);
                const totalPages = Math.ceil(total / itemsPerPage);
                
                // Obtener registros paginados
                const data = await Inventario.find(filtro)
                    .populate('producto')
                    .populate('proveedor')
                    .populate('status')
                    .populate('centroCosto')
                    .populate('assignedUser')
                    .skip(skip)
                    .limit(itemsPerPage);
                
                inventarioFiltrado = {
                    data,
                    total,
                    totalPages,
                    currentPage,
                    hasNext: currentPage < totalPages,
                    hasPrev: currentPage > 1
                };
            }

        } else {
            logger.warn('Usando filtrado normal o todos=true');
            // Filtrado normal sin categoría
            let filtro: any = {};
            if (!todos) {
                if (productoId) filtro.producto = productoId;
                if (numeroSerie) filtro.serialNumber = { $regex: numeroSerie, $options: 'i' };
                if (centroCosto) {
                    const ccosto = await CentroCostos.findById(centroCosto);
                    if (!ccosto) {
                        throw createNotFoundError('No existe un centro de costo con ese ID', 'Centro de Costo: ' + centroCosto);
                    }
                    filtro.location = ccosto.codigo.toString();
                }
                if (proveedorId) filtro.proveedor = proveedorId;
                if (usuarioId) filtro.assignedUser = usuarioId;
            }

            // Contar total de registros
            const total = await Inventario.countDocuments(filtro);
            const totalPages = Math.ceil(total / itemsPerPage);
            
            // Buscar y poblar referencias relevantes con paginación
            const data = await Inventario.find(filtro)
                .populate('producto')
                .populate('proveedor')
                .populate('status')
                .populate('centroCosto')
                .populate('assignedUser')
                .skip(skip)
                .limit(itemsPerPage);
            
            inventarioFiltrado = {
                data,
                total,
                totalPages,
                currentPage,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1
            };
        }

        res.status(200).json({
            success: true,
            data: inventarioFiltrado.data,
            pagination: {
                total: inventarioFiltrado.total,
                totalPages: inventarioFiltrado.totalPages,
                currentPage: inventarioFiltrado.currentPage,
                hasNext: inventarioFiltrado.hasNext,
                hasPrev: inventarioFiltrado.hasPrev,
                itemsPerPage
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @description Obtiene estadísticas del inventario para el dashboard
 * @route GET /api/1.0/inventario/estadisticas
 * @access Private
 */
const obtenerEstadisticasInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info('Obteniendo estadísticas del inventario para dashboard');

        // Agregación para obtener conteo por categorías
        const estadisticasPorCategoria = await Inventario.aggregate([
            // Lookup con productos para obtener categoría
            {
                $lookup: {
                    from: 'productos',
                    localField: 'producto',
                    foreignField: '_id',
                    as: 'productoInfo'
                }
            },
            // Descomponer productos
            {
                $unwind: '$productoInfo'
            },
            // Lookup con categorías para obtener información completa
            {
                $lookup: {
                    from: 'tipos', // Tabla de categorías
                    localField: 'productoInfo.categoria',
                    foreignField: '_id',
                    as: 'categoriaInfo'
                }
            },
            // Descomponer categorías
            {
                $unwind: '$categoriaInfo'
            },
            // Agrupar por categoría y contar
            {
                $group: {
                    _id: '$categoriaInfo._id',
                    categoria: { $first: '$categoriaInfo.nombre' },
                    codigo: { $first: '$categoriaInfo.codigo' },
                    cantidad: { $sum: 1 },
                    valorTotal: { $sum: { $ifNull: ['$value', 0] } }
                }
            },
            // Ordenar por cantidad descendente
            {
                $sort: { cantidad: -1 }
            }
        ]);

        // Estadísticas por estado
        const estadisticasPorEstado = await Inventario.aggregate([
            {
                $lookup: {
                    from: 'subestadosactivos',
                    localField: 'status',
                    foreignField: '_id',
                    as: 'estadoInfo'
                }
            },
            {
                $unwind: '$estadoInfo'
            },
            {
                $group: {
                    _id: '$estadoInfo._id',
                    estado: { $first: '$estadoInfo.nombre' },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $sort: { cantidad: -1 }
            }
        ]);

        // Estadísticas por centro de costo (ubicación actual)
        const estadisticasPorUbicacion = await Inventario.aggregate([
            {
                $group: {
                    _id: '$location',
                    cantidad: { $sum: 1 },
                    valorTotal: { $sum: { $ifNull: ['$value', 0] } }
                }
            },
            {
                $sort: { cantidad: -1 }
            },
            {
                $limit: 10 // Top 10 ubicaciones
            }
        ]);

        // Estadísticas generales
        const totalInventario = await Inventario.countDocuments();
        const valorTotalInventario = await Inventario.aggregate([
            {
                $group: {
                    _id: null,
                    valorTotal: { $sum: { $ifNull: ['$value', 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                resumen: {
                    totalItems: totalInventario,
                    valorTotal: valorTotalInventario[0]?.valorTotal || 0
                },
                porCategoria: estadisticasPorCategoria,
                porEstado: estadisticasPorEstado,
                porUbicacion: estadisticasPorUbicacion
            }
        });

    } catch (error) {
        logger.error('Error al obtener estadísticas del inventario:', error);
        next(error);
    }
};

/**
 * @description Obtiene estadísticas del inventario agrupadas por ubicación
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const obtenerEstadisticasPorUbicacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Estadísticas por ubicación (usando el campo location que contiene el código del centro de costo)
        const estadisticasPorUbicacion = await Inventario.aggregate([
            {
                $match: {
                    isActive: true,
                    isDeleted: false,
                    location: { $exists: true, $nin: [null, ""] }
                }
            },
            {
                $lookup: {
                    from: 'centrocostos',
                    localField: 'location',
                    foreignField: 'codigo',
                    as: 'centroCostoInfo'
                }
            },
            {
                $unwind: {
                    path: '$centroCostoInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$location',
                    codigo: { $first: '$location' },
                    ubicacion: { $first: { $ifNull: ['$centroCostoInfo.nombre', '$location'] } },
                    cantidad: { $sum: 1 },
                    valorTotal: { $sum: { $ifNull: ['$value', 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    codigo: 1,
                    ubicacion: 1,
                    cantidad: 1,
                    valorTotal: 1
                }
            },
            {
                $sort: { cantidad: -1 }
            }
        ]);

        // Estadísticas por centro de costo (como alternativa/complemento)
        const estadisticasPorCentroCosto = await Inventario.aggregate([
            {
                $match: {
                    isActive: true,
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: 'centrocostos',
                    localField: 'centroCosto',
                    foreignField: '_id',
                    as: 'centroCostoInfo'
                }
            },
            {
                $unwind: '$centroCostoInfo'
            },
            {
                $group: {
                    _id: '$centroCosto',
                    codigo: { $first: '$centroCostoInfo.codigo' },
                    ubicacion: { $first: '$centroCostoInfo.nombre' },
                    cantidad: { $sum: 1 },
                    valorTotal: { $sum: { $ifNull: ['$value', 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    codigo: 1,
                    ubicacion: 1,
                    cantidad: 1,
                    valorTotal: 1
                }
            },
            {
                $sort: { cantidad: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                porUbicacion: estadisticasPorUbicacion,
                porCentroCosto: estadisticasPorCentroCosto
            }
        });

    } catch (error) {
        logger.error('Error al obtener estadísticas por ubicación:', error);
        next(error);
    }
};

export {
    agregarInventario,
    crearInventarioDesdeRecepcion,
    filtrarInventaro,
    obtenerEstadisticasInventario,
    obtenerEstadisticasPorUbicacion,
}