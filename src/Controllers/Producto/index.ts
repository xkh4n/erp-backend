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

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph, IsProceso, IsBoolean, IsId } from '../../Library/Validations';

const setProducto = async (req: Request, res: Response) : Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IProducto>[] = [];
        logger.info('Producto: ', req.body);
        for (let i = 0; i < total; i++) {
            const {nombre, modelo, descripcion} = req.body[i];
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
                descripcion
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

export { setProducto };