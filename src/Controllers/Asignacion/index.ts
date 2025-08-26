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
import SubEstadosActivos from '../../Models/subEstadosActivosModel';
import DetalleSolicitud from '../../Models/detalleSolicitudModel';
import Categorias from '../../Models/categoriasModel';

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

        // Buscar la persona por DNI
        const Persona = await Persons.findOne({ dni: dni });
        if (!Persona) {
            throw createNotFoundError('Persona no encontrada');
        }

        // Buscar el producto por serie
        const Producto = await Inventario.findOne({ serialNumber: serie }).populate('producto');
        if (!Producto) {
            throw createNotFoundError('Producto no encontrado');
        }

        // Buscar el centro de costo
        const CCosto = await CentroCostos.findOne({ codigo: centrocosto });
        if (!CCosto) {
            throw createNotFoundError('Centro de costo no encontrado');
        }

        // Buscar el estado "ASIGNADO"
        const estadoAsignado = await SubEstadosActivos.findOne({ nombre: 'ASIGNADO' });
        if (!estadoAsignado) {
            throw createNotFoundError('Estado "ASIGNADO" no encontrado en el sistema');
        }

        // Verificar si el activo ya está asignado
        const existingAsignacion = await Asignaciones.findOne({ serie: serie });
        if (existingAsignacion) {
            throw createConflictError('El Activo ya está asignado');
        }

        // Buscar el detalle de solicitud para obtener la categoría
        const detalleSolicitud = await DetalleSolicitud.findOne({ producto: Producto.producto }).populate('tipoEquipamiento');
        let validityType = 'N/A';
        
        if (detalleSolicitud && detalleSolicitud.tipoEquipamiento) {
            const categoria = await Categorias.findById(detalleSolicitud.tipoEquipamiento);
            if (categoria) {
                validityType = categoria.nombre;
            }
        }

        // Calcular fecha de vencimiento (1 año desde hoy)
        const fechaVencimiento = new Date();
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
        
        // Crear la asignación
        const newAsignacion = await Asignaciones.create({
            userId: Persona._id,
            serie,
            fechaVencimiento,
            estado: estadoAsignado._id,
            ccosto: CCosto._id,
            inventoryid: Producto._id
        });

        // Actualizar el inventario con la asignación
        await Inventario.findByIdAndUpdate(Producto._id, {
            assignedUser: Persona._id,
            location: CCosto.codigo.toString(),
            validityType: validityType,
            status: estadoAsignado._id
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