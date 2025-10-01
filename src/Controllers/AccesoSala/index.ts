/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Asignacion Controller:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";


/* INTERFACES */
import {IAccesoSala, IDependencia} from '../../Interfaces';

/* MODELS */
import AccesoSala from '../../Models/accesoSala';
import Persons from '../../Models/personsModel';
import Users from '../../Models/userModel';
import Dependencias from '../../Models/salasModel';


/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodTipo, IsName, IsParagraph, IsBoolean, IsId, IsUsername, IsNumero } from '../../Library/Validations';
import User from '../../Models/userModel';


const dependencias: IDependencia[] = [
    {
        codigo: 1,
        nombre: "Data Center"
    },
    {
        codigo: 2,
        nombre: "Sala Comunicaciones"
    },
    {
        codigo: 3,
        nombre: "Tienda"
    },
    {
        codigo: 4,
        nombre: "Bodega"
    },
    {
        codigo: 5,
        nombre: "Oficinas"
    }
];

const createAccesoSala = async (req: Request, res: Response): Promise<void> => {
    try {
        const { solicitante, dependencia, centroCosto, motivo, beneficiario, fechaIngreso } = req.body;
        // Validate request data
        if (!solicitante || !dependencia || !centroCosto || !motivo || !beneficiario || !fechaIngreso ) {
            throw createValidationError('Todos los campos son obligatorios', []);
        }

        if(!IsParagraph(solicitante) || !IsParagraph(beneficiario) || !IsParagraph(motivo)){
            throw createValidationError('Los campos solicitante, beneficiario y motivo deben ser texto', []);
        }
        
        // Validar que dependencia sea numérica (1-5)
        if(!IsNumero(parseInt(dependencia))){
            throw createValidationError('El campo dependencia debe ser numérico', []);
        }
        
        // Validar que centroCosto sea un ObjectId válido de MongoDB
        if(!IsId(centroCosto)){
            throw createValidationError('El campo centro de costo debe ser un ID válido', []);
        }

        // Validar fecha de ingreso
        const fechaIngresoParsed = new Date(fechaIngreso);
        const fechaActual = new Date();
        fechaActual.setHours(fechaActual.getHours() - 4); // Restar 4 horas
        
        // Verificar que sea una fecha válida
        if (isNaN(fechaIngresoParsed.getTime())) {
            throw createValidationError('La fecha de ingreso no es válida. Use el formato YYYY-MM-DD', []);
        }
        
        // Verificar que la fecha no sea anterior a hoy
        if (fechaIngresoParsed < fechaActual) {
            throw createValidationError('La fecha de ingreso no puede ser anterior a la fecha actual', []);
        }

        // Buscar la dependencia por código
        const dependenciaEncontrada = dependencias.find(dep => dep.codigo === parseInt(dependencia));
        
        if (!dependenciaEncontrada) {
            throw createValidationError('La dependencia seleccionada no es válida', []);
        }

        const userIdSolicitante = await Persons.findOne({ name: solicitante });
        logger.debug('Usuario solicitante encontrado:', userIdSolicitante);
        if(!userIdSolicitante){
            throw createValidationError('El solicitante no existe en el sistema', []);
        }
        const userIdUsername = await Users.findOne({ personId: userIdSolicitante._id });
        logger.debug('Usuario por ID de persona encontrado:', userIdUsername);
        const salaId = await Dependencias.findOne({ codigo: parseInt(dependencia) });
        if(!salaId){
            throw createValidationError('La dependencia seleccionada no es válida', []);
        }
        // Create new AccesoSala instance
        const nuevoAcceso = new AccesoSala({
            userId: userIdUsername._id,
            salaId: salaId._id,
            fechaAcceso: fechaIngreso,
            state: 'pendiente',
            centrocostoId: centroCosto,
            beneficiario,
            motivo,
            estado: 'activo' // Default state
        });

        // Save to database
        await nuevoAcceso.save();

        res.status(201).json({
            codigo: 201,
            data: nuevoAcceso
        });
    }  catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getAccesosPendientes = async (req: Request, res: Response): Promise<void> => {
    try {
        const accesosPendientes = await AccesoSala.find({ state: 'pendiente' })
            .populate({
                path: 'userId',
                select: 'username personId',
                populate: {
                    path: 'personId',
                    model: 'Persons',
                    select: 'name'
                }
            })
            .populate({
                path: 'salaId',
                model: 'Dependencias',
                select: 'nombre'
            })
            .populate({
                path: 'centrocostoId',
                model: 'CentroCostos',
                select: 'nombre'
            })
            .exec();
        
        res.status(200).json({
            codigo: 200,
            data: accesosPendientes
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const updateAccesoSala = async (req: Request, res: Response): Promise<void> => {
    try {
        const { solicitud, aprobador, estado } = req.body;
        const acceso = await AccesoSala.findById(solicitud);
        if (!acceso) {
            throw createValidationError('Acceso no encontrado', []);
        }
        acceso.state = estado;
        acceso.autorizadoPor = aprobador;
        await acceso.save();
        res.status(200).json({
            codigo: 200,
            data: acceso
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getAccesosAprobados = async (req: Request, res: Response): Promise<void> => {
    try {
        const accesosAprobados = await AccesoSala.find({ state: 'aprobado' })
            .populate({
                path: 'userId',
                select: 'username personId',
                populate: {
                    path: 'personId',
                    model: 'Persons',
                    select: 'name'
                }
            })
            .populate({
                path: 'salaId',
                model: 'Dependencias',
                select: 'nombre'
            })
            .populate({
                path: 'centrocostoId',
                model: 'CentroCostos',
                select: 'nombre'
            })
            .exec();

        res.status(200).json({
            codigo: 200,
            data: accesosAprobados
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }
        else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    createAccesoSala,
    getAccesosPendientes,
    updateAccesoSala,
    getAccesosAprobados
};