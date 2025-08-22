/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Asignacion Controller:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IAsignacion } from '../../Interfaces';

/* MODELS */
import Asignaciones from '../../Models/asignacionModel';
import CentroCostos from '../../Models/centrocostosModel';
import Inventario from '../../Models/inventarioModel';
import Persons from '../../Models/personsModel';

/* DEPENDENCIES */
import { Request, Response, NextFunction } from 'express';
import { IsNumero, IsParagraph, IsRut } from '../../Library/Validations';


const asignarActivo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dni, serie, centrocosto } = req.body;

        if(!IsRut(dni)) {
            return next(createValidationError('DNI inválido'));
        }
        if(!IsParagraph(serie)) {
            return next(createValidationError('Serie inválida'));
        }
        if(!IsNumero(centrocosto)) {
            return next(createValidationError('Centro de costo inválido'));
        }
        const Persona = await Persons.findOne({ where: { dni } });
        if (!Persona) {
            throw createNotFoundError('Persona no encontrada');
        }
        const Producto = await Inventario.findOne({ where: { serie } });
        if (!Producto) {
            throw createNotFoundError('Producto no encontrado');
        }
        const CCosto = await CentroCostos.findOne({ where: { id: centrocosto } });
        if (!CCosto) {
            throw createNotFoundError('Centro de costo no encontrado');
        }
        const existingAsignacion = await Asignaciones.findOne({ where: { serie } });
        if (existingAsignacion) {
            throw createConflictError('El Activo ya está asignado');
        }
        const newAsignacion = await Asignaciones.create({
            serie,
            centrocosto: CCosto.id,
            personaId: Persona.id
        });
        res.status(201).json({
            message: 'Asignación creada exitosamente',
            data: newAsignacion
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
};

export{
    asignarActivo
}