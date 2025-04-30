/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Proceso Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IProceso } from '../../Interfaces';

/* MODELS */
import Proceso from '../../Models/procesoModel';
import Servicio from '../../Models/serviciosModel';


/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph, IsProceso, IsBoolean, IsId } from '../../Library/Validations';

const setProceso = async (req: Request, res: Response) : Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IProceso>[] = [];
        if (total === 0) {
            throw createValidationError('No se envió ningún dato', req.body);
        }
        for (let i=0; i<total; i++) {
            const { codigo, nombre, descripcion, estado, servicio } = req.body[i];
            if (!IsProceso(codigo)) {
                throw createValidationError('El código debe ser un número entero', codigo);
            }
            if (!IsName(nombre)) {
                throw createValidationError('El nombre debe ser una cadena de texto', nombre);
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción debe ser una cadena de texto', descripcion);
            }
            if (!IsBoolean(estado)) {
                throw createValidationError('El estado debe ser un booleano', estado);
            }
            if (!IsCodGerencia(servicio)) {
                throw createValidationError('El servicio debe ser un número entero', servicio);
            }
            const fibdServicio = await Servicio.findOne({ codigo: servicio });
            if (!fibdServicio) {
                throw createNotFoundError('No existe un servicio con ese código', servicio);
            }
            const newProceso = new Proceso({
                codigo,
                nombre,
                descripcion,
                estado,
                servicio: fibdServicio._id
            })
            try {
                await newProceso.save();
                promise.push(Promise.resolve(newProceso));
            } catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Proceso con ese código', codigo);
                }
                throw createServerError('Sucedió un error Inesperado al guardar la Proceso', nombre);
            }
        }
        const proceso = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: proceso
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

const getAllProceso = async (req: Request, res: Response) : Promise<void> => {
    try {
        const proceso = await Proceso.find();
        if(!proceso){
            throw createNotFoundError('No existen Proceso');
        }
        res.status(200).json({
            codigo: 200,
            data: proceso
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

const getProcesoById = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { id } = req.body;
        if (!IsId(id)) {
            throw createValidationError('El ID no es válido: ', id);
        }
        const proceso = await Proceso.findById(id);
        if(!proceso){
            throw createNotFoundError('No existe una Proceso con ese ID');
        }
        res.status(200).json({
            codigo: 200,
            data: proceso
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

const getProcesoByCodigo = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { codigo } = req.body;
        if (!IsProceso(codigo)) {
            throw createValidationError('El código no es válido: ', codigo);
        }
        const proceso = await Proceso.findOne({ codigo });
        if(!proceso){
            throw createNotFoundError('No existe una Proceso con ese código');
        }
        res.status(200).json({
            codigo: 200,
            data: proceso
        })
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

const getProcesoByServicio = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { servicio } = req.body;
        if (!IsCodGerencia(servicio)) {
            throw createValidationError('El servicio no es válido: ', servicio);
        }
        const service = await Servicio.findOne({ codigo: servicio });
        if (!service) {
            throw createNotFoundError('No existe un Servicio con ese código', servicio);
        }
        const proceso = await Proceso.find({ servicio:service._id });
        if(!proceso){
            throw createNotFoundError('No existe una Proceso con ese servicio');
        }
        res.status(200).json({
            codigo: 200,
            data: proceso
        })
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

const updateProcesoById = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { id } = req.body;
        if (!IsId(id)) {
            throw createValidationError('El ID no es válido: ', id);
        }
        const proceso = await Proceso.findById(id);
        if(!proceso){
            throw createNotFoundError('No existe una Proceso con ese ID');
        }
        const { codigo, nombre, descripcion, estado, servicio } = req.body;
        if (codigo && !IsProceso(codigo)) {
            throw createValidationError('El código no es válido: ', codigo);
        }
        if (nombre && !IsName(nombre)) {
            throw createValidationError('El nombre no es válido: ', nombre);
        }
        if (descripcion &&!IsParagraph(descripcion)) {
            throw createValidationError('La descripción no es válida: ', descripcion);
        }
        if (estado &&!IsBoolean(estado)) {
            throw createValidationError('El estado no es válido: ', estado);
        }
        if (servicio &&!IsCodGerencia(servicio)) {
            throw createValidationError('El servicio no es válido: ', servicio);
        }
        const service = await Servicio.findOne({ codigo: servicio });
        if (!service) {
            throw createNotFoundError('No existe un Servicio con ese código', servicio);
        }
        const newProceso = await Proceso.findByIdAndUpdate(id, {
            codigo,
            nombre,
            descripcion,
            estado: estado,
            departamento: service._id
        }, {new: true});
        if(!newProceso){
            throw createNotFoundError('No existe un Proceso con ese id', id);
        }
        res.status(200).json({
            codigo: 200,
            data: newProceso
        })
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

const updateProcesoByCodigo = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { codigo } = req.body;
        if (!IsProceso(codigo)) {
            throw createValidationError('El código no es válido: ', codigo);
        }
        const proceso = await Proceso.findOne({ codigo });
        if(!proceso){
            throw createNotFoundError('No existe una Proceso con ese código');
        }
        const { nombre, descripcion, estado, servicio } = req.body;
        if (nombre &&!IsName(nombre)) {
            throw createValidationError('El nombre no es válido: ', nombre);
        }
        if (descripcion &&!IsParagraph(descripcion)) {
            throw createValidationError('La descripción no es válida: ', descripcion);
        }
        if (estado &&!IsBoolean(estado)) {
            throw createValidationError('El estado no es válido: ', estado);
        }
        if (servicio &&!IsCodGerencia(servicio)) {
            throw createValidationError('El servicio no es válido: ', servicio);
        }
        const service = await Servicio.findOne({ codigo: servicio });
        if (!service) {
            throw createNotFoundError('No existe un Servicio con ese código', servicio);
        }
        const newProceso = await Proceso.findOneAndUpdate({ codigo }, {
            nombre,
            descripcion,
            estado: estado,
            departamento: service._id
        }, {new: true});
        if(!newProceso){
            throw createNotFoundError('No existe un Proceso con ese código', codigo);
        }
        res.status(200).json({
            codigo: 200,
            data: newProceso
        })
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

export {
    setProceso,
    getAllProceso,
    getProcesoById,
    getProcesoByCodigo,
    getProcesoByServicio,
    updateProcesoById,
    updateProcesoByCodigo
}