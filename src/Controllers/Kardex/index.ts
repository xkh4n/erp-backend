/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Gerencia Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IKardex } from "../../Interfaces/Kardex";

/** MODELS */
import Kardex from "../../Models/kardexModel";
import Product from "../../Models/productoModel";

/* DEPENDENCIES */
import { Request, Response } from "express";
import mongoose from "mongoose";

const setKardex = async (req: Request, res: Response): Promise<void> => {
    const total = Object.keys(req.body).length;
    if (total === 0) {
        throw createValidationError('No se enviaron datos', []);
    }
    const kardexEntries: IKardex[] = [];
    try {
        for (let x = 0; x < total; x++) {
            const { product, movementType, quantity, cost, reference, date } = req.body[x];
            
            // VALIDACIONES BÁSICAS
            if (!product || !movementType || quantity === undefined) {
                throw createValidationError('Los campos product, movementType y quantity son obligatorios', '');
            }
            
            // Validar que el ID del producto sea válido
            if (!mongoose.Types.ObjectId.isValid(product)) {
                throw createValidationError('El ID del producto no es válido', 'Product ID: ' + product);
            }
            
            // Validar tipo de movimiento permitido
            const validMovementTypes = ['entry', 'exit', 'adjustment'];
            if (!validMovementTypes.includes(movementType)) {
                throw createValidationError('Tipo de movimiento no válido', 'movementType: ' + movementType);
            }
            
            // Validar cantidad según tipo de movimiento
            if (movementType === 'entry' || movementType === 'exit') {
                if (quantity <= 0) {
                    throw createValidationError('La cantidad debe ser mayor a cero para entradas y salidas', 'quantity: ' + quantity);
                }
            }
            
            // Validación de datos adicionales
            if (cost !== undefined && cost < 0) {
                throw createValidationError('El costo no puede ser negativo', 'cost: ' + cost);
            }
            
            // Verificar existencia del producto
            const existingProduct = await Product.findById(product);
            if (!existingProduct) {
                throw createNotFoundError('El producto no existe', 'Product ID: ' + product);
            }
            
            // Obtener último movimiento para calcular el saldo
            const lastEntry = await Kardex.findOne({ product })
                .sort({ date: -1 })
                .select('balance');
            
            const previousBalance = lastEntry ? lastEntry.balance : 0;
            
            // Cálculo del nuevo saldo (validación crítica para evitar saldos negativos)
            let newBalance: number;
            switch (movementType) {
                case 'entry':
                    newBalance = previousBalance + quantity;
                    break;
                case 'exit':
                    newBalance = previousBalance - quantity;
                    if (newBalance < 0) {
                        throw createValidationError('Saldo insuficiente para realizar la salida', 
                            `Producto: ${product} | Saldo actual: ${previousBalance} | Cantidad solicitada: ${quantity}`);
                    }
                    break;
                case 'adjustment':
                    // Para ajustes, podríamos permitir establecer el saldo directamente
                    // o calcularlo como previousBalance + quantity (con quantity positivo o negativo)
                    newBalance = quantity; // Ajuste directo al saldo
                    if (newBalance < 0) {
                        throw createValidationError('El saldo después del ajuste no puede ser negativo', 
                            `Saldo ajustado: ${newBalance}`);
                    }
                    break;
                default:
                    throw createValidationError('Tipo de movimiento no soportado', movementType);
            }
            
            // Crear nuevo registro de Kardex
            const newKardex = new Kardex({
                product,
                date: date || new Date(),
                movementType,
                quantity,
                cost: cost || 0,
                balance: newBalance,
                reference: reference || 'Manual'
            });
            
            // Validación del modelo antes de guardar
            const validationError = newKardex.validateSync();
            if (validationError) {
                throw createValidationError('Error de validación en los datos', validationError.message);
            }
            
            await newKardex.save();
            kardexEntries.push(newKardex);
        }
        
        res.status(201).json({
            codigo: 201,
            data: kardexEntries
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al procesar el Kardex');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    setKardex,
};