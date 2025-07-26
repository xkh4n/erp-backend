/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Servicio Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IServicio } from '../../Interfaces';

/* MODELS */
import Servicio from '../../Models/serviciosModel';
import Departamento from '../../Models/departamentoModel';


/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsId, IsNameDepto, IsParagraph, IsBoolean } from '../../Library/Validations';

const setServicio = async (req: Request, res: Response) : Promise<void>  => {
    console.log("Hola desde Servicio Controller");
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IServicio>[] = [];
        for (let i = 0; i < total; i++) {
            const {codigo, nombre, descripcion, departamento, estado} = req.body[i];
            if (!IsCodGerencia(codigo)) {
                throw createValidationError('El código debe tener 4 dígitos', codigo);
            }
            if (!IsNameDepto(nombre)) {
                throw createValidationError('El nombre debe tener entre 3 y 50 caracteres', nombre);
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción debe tener entre 3 y 100 caracteres', descripcion);
            }
            if (!IsBoolean(estado)) {
                throw createValidationError('El estado debe ser verdadero o falso', estado);
            }
            const fibdDepartamento = await Departamento.findOne({codigo: departamento});
            if (!fibdDepartamento) {
                throw createNotFoundError('No existe un departamento con ese código', departamento);
            }
            const newServicio = new Servicio({
                codigo,
                nombre,
                descripcion,
                estado: true,
                departamento: fibdDepartamento._id
            })
            try {
                await newServicio.save();
                promise.push(Promise.resolve(newServicio));
            } catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Servicio con ese código', codigo);
                }
                throw createServerError('Sucedió un error Inesperado al guardar el Servicio', nombre);
            }
        }
        const service = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: service
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

const getAllServicios = async (req: Request, res: Response) : Promise<void>  => {
    try {
        const servicios = await Servicio.find({estado: true});
        if(!servicios){
            throw createNotFoundError('No existen Servicios');
        }
        res.status(200).json({
            codigo: 200,
            data: servicios
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

const getServicioById = async (req: Request, res: Response) : Promise<void>  => {
    try {
        const {id} = req.body;
        if(!IsId(id)) {
            throw createValidationError('El id no es válido', id);
        }
        const servicio = await Servicio.findById(id);
        if(!servicio){
            throw createNotFoundError('No existe un Servicio con ese id', id);
        }
        res.status(200).json({
            codigo: 200,
            data: servicio
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

const getServicioByDeptoCode = async (req: Request, res: Response) : Promise<void>  => {
    try {
        const {departamento} = req.body;
        if(!IsCodGerencia(departamento)) {
            throw createValidationError('El código no es válido', departamento);
        }
        const depto = await Departamento.findOne({codigo: departamento});
        if(!depto){
            throw createNotFoundError('No existe un Departamento con ese codigo: ', departamento);
        }
        const servicio = await Servicio.find({departamento: depto._id});
        if(!servicio){
            throw createNotFoundError('No existe un Servicio con ese id', departamento);
        }
        res.status(200).json({
            codigo: 200,
            data: servicio
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

const getServicioByCodigo = async (req: Request, res: Response) : Promise<void>  => {
    try {
        const {codigo} = req.body;
        if(!IsCodGerencia(codigo)) {
            throw createValidationError('El código no es válido', codigo);
        }
        const servicios = await Servicio.findOne({codigo: codigo});
        if(!servicios){
            throw createNotFoundError('No existe un Departamento con ese codigo: ', codigo);
        }
        res.status(200).json({
            codigo: 200,
            data: servicios
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

const updateServicioById = async (req: Request, res: Response) : Promise<void>  => {
    try {
        const {id} = req.body;
        if(!IsId(id)) {
            throw createValidationError('El id no es válido', id);
        }
        const servicio = await Servicio.findById(id);
        if(!servicio){
            throw createNotFoundError('No existe un Servicio con ese id', id);
        }
        const {codigo, nombre, descripcion, departamento, estado} = req.body;
        if (!IsCodGerencia(codigo)) {
            throw createValidationError('El código no es válido', codigo);
        }
        if (!IsNameDepto(nombre)) {
            throw createValidationError('El nombre no es válido', nombre);
        }
        if (!IsParagraph(descripcion)) {
            throw createValidationError('La descripción no es válida', descripcion);
        }
        if (!IsId(departamento)) {
            throw createValidationError('El código no es válido', departamento);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        const depto = await Departamento.findOne({_id: departamento});
        if(!depto){
            throw createNotFoundError('No existe un Departamento con ese codigo: ', departamento);
        }
        const newServicio = await Servicio.findByIdAndUpdate(id, {
            codigo: codigo,
            nombre: nombre,
            descripcion: descripcion,
            estado: estado,
            departamento: depto._id
        }, {new: true});
        if(!newServicio){
            throw createNotFoundError('No existe un Servicio con ese id', id);
        }
        res.status(200).json({
            codigo: 200,
            data: newServicio
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


const updateServicioByCodigo = async (req: Request, res: Response) : Promise<void>  => {
    try {
        const {codigo, nombre, descripcion, estado, departamento} = req.body;
        if(!IsCodGerencia(codigo)) {
            throw createValidationError('El código no es válido', codigo);
        }
        const depto = await Departamento.findOne({codigo: departamento});
        if(!depto){
            throw createNotFoundError('No existe un Departamento con ese codigo: ', codigo);
        }
        if (nombre &&!IsNameDepto(nombre)) {
            throw createValidationError('El nombre no es válido', nombre);
        }
        if (descripcion &&!IsParagraph(descripcion)) {
            throw createValidationError('La descripción no es válida', descripcion);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        const newServicio = await Servicio.findOneAndUpdate({codigo: codigo}, {
            nombre,
            descripcion,
            estado: estado,
            departamento: depto._id
        })
        if(!newServicio){
            throw createNotFoundError('No existe un Servicio con ese id', codigo);
        }
        res.status(200).json({
            codigo: 200,
            data: newServicio
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
    setServicio,
    getAllServicios,
    getServicioById,
    getServicioByCodigo,
    getServicioByDeptoCode,
    updateServicioById,
    updateServicioByCodigo,
}