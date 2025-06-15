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
import Tipos from '../../Models/tiposModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsParagraph, IsCodTipo } from '../../Library/Validations';

const setProducto = async (req: Request, res: Response) : Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IProducto>[] = [];
        for (let i = 0; i < total; i++) {
            const {nombre, modelo, descripcion, categoria} = req.body[i];
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
            const newProducto = new Producto({
                nombre,
                modelo,
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

export { setProducto, getAllProductos, getProductoByCategoria };