/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Producto Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IProducto } from '../../Interfaces';

/* MODELS */
import Producto from '../../Models/productoModel';
import Tipos from '../../Models/categoriasModel';
import DetalleSolicitudModel from "../../Models/detalleSolicitudModel";
import KardexModel from "../../Models/kardexModel";
import SolicitudModel from "../../Models/solicitudModel";

/* CONTROLLERS */
import { crearInventarioDesdeRecepcion } from "../Inventario/index";

/* DEPENDENCIES */
import { Request, Response } from "express";
import { getChileDateTime } from '../../Library/Utils/ManageDate';
import { IsParagraph, IsCodTipo, IsId, IsNumero } from '../../Library/Validations';

const setProducto = async (req: Request, res: Response) : Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IProducto>[] = [];
        for (let i = 0; i < total; i++) {
            const {nombre, modelo, descripcion, categoria, marca} = req.body[i];
            if(!IsCodTipo(categoria)) {
                throw createValidationError('El código de la categoría debe tener 5 caracteres alfanuméricos', 'Categoría: ' + categoria);  
            }
            const tipo = await Tipos.findOne({codigo: categoria});
            if (!tipo) {
                throw createNotFoundError('No existe una categoría con ese código', 'Categoría: ' + categoria);
            }
            if (!IsParagraph(nombre)) {
                throw createValidationError('El nombre del producto debe tener entre 3 y 50 caracteres', 'Nombre: ' + nombre );
            }
            if (!IsParagraph(modelo)) {
                throw createValidationError('El modelo del producto debe tener entre 3 y 50 caracteres', 'Modelo: '+ modelo );
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción del producto debe tener entre 3 y 50 caracteres', 'Descripción: '+ descripcion );
            }
            if(!IsParagraph(marca)) {
                throw createValidationError('La marca del producto debe tener entre 3 y 50 caracteres', 'Marca: ' + marca);
            }
            const newProducto = new Producto({
                nombre,
                modelo,
                marca,
                descripcion,
                categoria: tipo._id
            });
            try {
                await newProducto.save();
                promise.push(Promise.resolve(newProducto));
            } catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Producto con ese nombre', nombre);
                }
                throw createServerError('Sucedió un error Inesperado al guardar la Producto', nombre);
            }
        }
        const producto = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: producto
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

const getAllProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        const productos = await Producto.find();
        if (productos.length === 0) {
            throw createNotFoundError('No existen Productos registrados');
        }
        res.status(200).json({
            codigo: 200,
            data: productos
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

const getProductoByCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        if (total < 1) {
            const productos = {};
            res.status(200).json({
                codigo: 200,
                data: productos
            });
        }
        else{
            const { categoria } = req.body;
            if (!IsCodTipo(categoria)) {
                throw createValidationError('El código de la categoría debe tener 5 caracteres alfanuméricos', 'Categoría: ' + categoria);
            }
            const tipo = await Tipos.findOne({ codigo: categoria });
            if (!tipo) {
                throw createNotFoundError('No existe una categoría con ese código', 'Categoría: ' + categoria);
            }
            const productos = await Producto.find({ categoria: tipo._id });
            if (productos.length === 0) {
                throw createNotFoundError('No existen Productos registrados para esta categoría');
            }
            res.status(200).json({
                codigo: 200,
                data: productos
            });
        }
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

const getPruductoByIdCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if (!IsId(id)) {
            throw createValidationError('El ID de la categoría no correspondes', 'Categoría: ' + id);
        }
        const productos = await Producto.find({ categoria: id });
        if (productos.length === 0) {
            throw createNotFoundError('No existen Productos registrados para esta categoría');
        }
        res.status(200).json({
            codigo: 200,
            data: productos
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

const recibirProducto = async (req: Request, res: Response): Promise<void> => {

    /*
        Se suma un producto de ese tipo al Kardex
        Se agrega ese producto al inventario
        Se suma 1 al contador de cantidadEntregada en el detalle de la solicitud
    */
    const { 
        productoId, 
        cantidad, 
        numeroSerie, 
        nroSolicitud, 
        gerencia, 
        valor, 
        modelo, 
        marca,
        proveedorId,
        tipoDocumento,
        numeroDocumento
    } = req.body;
    try {
        // Validar datos de entrada
        const precio = Number(valor) || 0;
        const total = Number(cantidad) || 0;
        if (!productoId || !numeroSerie || !nroSolicitud || !gerencia || !modelo || !marca || !proveedorId || !tipoDocumento || !numeroDocumento) {
            throw createValidationError('Faltan datos obligatorios para la recepción (productoId, cantidad, numeroSerie, nroSolicitud, gerencia, valor, modelo, marca, proveedorId, tipoDocumento, numeroDocumento)', []);
        }
        if (!IsId(productoId)) {
            throw createValidationError('El ID del producto no es válido', productoId);
        }
        if (!IsId(gerencia)) {
            throw createValidationError('El ID de la gerencia no es válido', gerencia);
        }
        if (!IsId(proveedorId)) {
            throw createValidationError('El ID del proveedor no es válido', proveedorId);
        }
        if (!IsParagraph(numeroSerie)) {
            throw createValidationError('El número de serie debe tener entre 3 y 50 caracteres', numeroSerie);
        }
        if (!IsParagraph(tipoDocumento)) {
            throw createValidationError('El tipo de documento debe ser válido', tipoDocumento);
        }
        if (!IsParagraph(numeroDocumento)) {
            throw createValidationError('El número de documento debe ser válido', numeroDocumento);
        }
        if(!IsNumero(precio)){
            throw createValidationError('El valor debe ser un número válido', precio);
        }
        if(!IsNumero(total)){
            throw createValidationError('El total debe ser un número válido', total);
        }
        if(!IsParagraph(modelo)){
            throw createValidationError('El modelo debe ser un texto válido', modelo);
        }
        if(!IsParagraph(marca)){
            throw createValidationError('La marca debe ser un texto válido', marca);
        }

        // 1. Crear el producto en el inventario usando la función auxiliar
        const inventarioCreado = await crearInventarioDesdeRecepcion(
            productoId, 
            numeroSerie, 
            gerencia, 
            modelo, 
            precio,
            nroSolicitud,
            proveedorId,
            tipoDocumento,
            numeroDocumento
        );
        // 2. Agregar entrada al Kardex
        const ultimoMovimientoKardex = await KardexModel.findOne({ product: productoId })
            .sort({ date: -1, fechaCreacion: -1 })
            .lean();

        // 3. Actualizar Detalle de Solicitud con cantidad entregada
        const detalleSolicitud = await DetalleSolicitudModel.findOne({
            nroSolicitud: nroSolicitud,
            producto: productoId
        });

        if (!detalleSolicitud) {
            throw createNotFoundError('Detalle de solicitud no encontrado para el producto y número de solicitud especificados', { nroSolicitud, productoId });
        }
        // Actualizar cantidad entregada en el detalle de solicitud
        detalleSolicitud.cantidadEntregada = (detalleSolicitud.cantidadEntregada || 0) + total;
        detalleSolicitud.fechaModificacion = getChileDateTime();
        await detalleSolicitud.save();

        // Verificar si la solicitud debe cambiar a "en_proceso" si es la primera recepción
        const solicitud = await SolicitudModel.findOne({ nroSolicitud: nroSolicitud });
        if (solicitud && solicitud.estado === 'aprobado') {
            solicitud.estado = 'aprobado';
            solicitud.fechaModificacion = getChileDateTime();
            await solicitud.save();
        }

        const totalQuantity = detalleSolicitud.cantidadEntregada || 0 + total;
        const balanceAnterior = ultimoMovimientoKardex ? ultimoMovimientoKardex.balance : 0;
        const nuevoBalance = balanceAnterior + (precio * total); // Balance = valor acumulado (costo × cantidad)

        // Verificar si ya existe un registro de Kardex para este producto
        const kardexExistente = await KardexModel.findOne({ product: productoId });

        if (kardexExistente) {
            // Si existe, actualizar el registro existente
            kardexExistente.quantity += total; // Sumar la nueva cantidad
            kardexExistente.balance = nuevoBalance; // Actualizar balance total
            kardexExistente.date = getChileDateTime(); // Actualizar fecha del último movimiento
            kardexExistente.cost = precio; // Actualizar con el último costo (o podrías calcular promedio ponderado)
            kardexExistente.referencia = `REC-${inventarioCreado.inventoryCode}`;
            kardexExistente.observaciones = `Recepción directa - Solicitud: ${nroSolicitud} - Serie: ${numeroSerie.toUpperCase()}`;
            
            await kardexExistente.save();
        } else {
            // Si no existe, crear nuevo registro
            const entradaKardex = new KardexModel({
                product: productoId,
                movementType: 'entrada',
                quantity: total, // Cantidad inicial
                date: getChileDateTime(),
                cost: precio, // Costo unitario
                usuario: 'SISTEMA-RECEPCION',
                balance: nuevoBalance, // Valor total acumulado
                referencia: `REC-${inventarioCreado.inventoryCode}`,
                observaciones: `Recepción directa - Solicitud: ${nroSolicitud} - Serie: ${numeroSerie.toUpperCase()}`
            });
            
            await entradaKardex.save();
        }
        const recepcionGuardada = {
            inventario: inventarioCreado,
            kardex: {
                balance: nuevoBalance,
                movimiento: cantidad
            },
            detalleSolicitud: detalleSolicitud ? 'actualizado' : 'no encontrado'
        };

        logger.info(`Producto recibido exitosamente - Código inventario: ${inventarioCreado.inventoryCode} - Serie: ${numeroSerie}`);

        // Verificar si el producto está completamente recibido
        let mensajeRespuesta = 'Producto recibido exitosamente';
        let productoCompleto = false;
        let solicitudCompleta = false;
        
        if (detalleSolicitud.cantidadEntregada === detalleSolicitud.cantidadAprobada) {
            // El producto está completamente recibido, cambiar estado
            detalleSolicitud.estado = 'entregado';
            detalleSolicitud.fechaModificacion = getChileDateTime();
            await detalleSolicitud.save();
            
            mensajeRespuesta = 'Producto recibido completamente';
            productoCompleto = true;
            
            logger.info(`Producto completamente recibido - ProductoID: ${productoId} - Solicitud: ${nroSolicitud}`);
            
            // Verificar si todos los productos de la solicitud están completos
            const todosLosDetalles = await DetalleSolicitudModel.find({ nroSolicitud: nroSolicitud });
            const todosCompletos = todosLosDetalles.every(detalle => 
                detalle.cantidadEntregada === detalle.cantidadAprobada
            );
            
            if (todosCompletos) {
                // Actualizar el estado de la solicitud completa
                const solicitud = await SolicitudModel.findOne({ nroSolicitud: nroSolicitud });
                if (solicitud) {
                    solicitud.estado = 'completado';
                    solicitud.fechaModificacion = getChileDateTime();
                    await solicitud.save();
                    
                    solicitudCompleta = true;
                    mensajeRespuesta = 'Solicitud recibida completamente';
                    
                    logger.info(`Solicitud completamente recibida - Solicitud: ${nroSolicitud}`);
                }
            }
        }

        res.status(201).json({
            codigo: 201,
            mensaje: mensajeRespuesta,
            data: {
                ...recepcionGuardada,
                productoCompleto: productoCompleto,
                solicitudCompleta: solicitudCompleta,
                cantidadEntregada: detalleSolicitud.cantidadEntregada,
                cantidadAprobada: detalleSolicitud.cantidadAprobada
            }
        });
    } catch (error) {
        if (error instanceof CustomError) {
            logger.error(`Error en recibirProducto: ${error.message}`);
            res.status(error.code).json(error.toJSON());
        } else {
            logger.error(`Error inesperado en recibirProducto: ${error}`);
            res.status(500).json({
                codigo: 500,
                mensaje: 'Error interno del servidor',
                detalle: 'Error inesperado al procesar la recepción del producto'
            });
        }
    }
};
export {
    setProducto,
    getAllProductos,
    getProductoByCategoria,
    getPruductoByIdCategoria,
    recibirProducto
};