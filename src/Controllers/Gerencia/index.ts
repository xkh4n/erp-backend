/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Gerencia Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IGerencia } from '../../Interfaces';

/* MODELS */
import Gerencia from '../../Models/gerenciaModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsBoolean, IsCodGerencia, IsId, IsName, IsParagraph } from '../../Library/Validations';

const setGerencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createValidationError('No se enviaron datos', []);
        }
        const promise: Promise<IGerencia>[] = [];
        let state = false;
        for (const key in req.body) {
            const { codigo, nombre, descripcion, estado } = req.body[key];
            if(!IsName(nombre)){
                throw createValidationError('El nombre no es válido', nombre);
            }
            if(!IsCodGerencia(codigo)){
                throw createValidationError('El código no es válido', codigo);
            }
            if(!IsParagraph(descripcion)){
                throw createValidationError('La descripción no es válida', descripcion);
            }
            if (!IsBoolean(estado)){
                throw createValidationError('El estado no es válido', estado);
            }
            if (estado === 'true' || estado === '1' || estado === true || estado === 1) {
                state = true;
            }
            const newGerencia = new Gerencia({
                codigo,
                nombre,
                descripcion,
                estado: state
            });
            try {
                await newGerencia.save();
                promise.push(Promise.resolve(newGerencia));
            } catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una gerencia con ese código', codigo);
                }
                throw createServerError('Sucedió un error Inesperado al guardar la gerencia', nombre);
            }
        }
        const gerencia = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: gerencia
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

const getAllGerencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const gerencia = await Gerencia.find();
        if (gerencia.length === 0) {
            throw createNotFoundError('No se encontraron gerencias');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
        })
    }catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getGerenciaById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        const gerencia = await Gerencia.findById(id);
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
        })
    }catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getGerenciaByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre } = req.body;
        if(!IsName(nombre)){
            throw createValidationError('El nombre no es válido', nombre);
        }
        const gerencia = await Gerencia.findOne({ nombre });
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
        })
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


const getGerenciaByCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { codigo } = req.body;
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        const gerencia = await Gerencia.findOne({ codigo });
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
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

const getGerenciaByState = async (req: Request, res: Response): Promise<void> => {
    try {
        const { activo } = req.body;
        if (!IsBoolean(activo)) {
            throw createValidationError('El estado no es válido', activo);
        }
        let state = false;
        if (activo === 'true' || activo === '1' || activo === true || activo === 1) {
            state = true;
        }
        const gerencia = await Gerencia.find({ estado: state });
        if (gerencia.length === 0) {
            throw createNotFoundError('No se encontraron gerencias con ese estado');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
        })
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const updateGerenciaById = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createValidationError('No se enviaron datos', []);
        }

        const { id, codigo, nombre, descripcion, estado } = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        if(!IsName(nombre)){
            throw createValidationError('El nombre no es válido', nombre);
        }
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        if(!IsParagraph(descripcion)){
            throw createValidationError('La descripción no es válida', descripcion);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1'){
            state = true;
        }
        const gerencia = await Gerencia.findByIdAndUpdate(id, {
            codigo,
            nombre,
            descripcion,
            estado: state
        }, { new: true });
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
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

const updateGerenciaByCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createValidationError('No se enviaron datos', []);
        }

        const { codigo, nombre, descripcion, estado } = req.body;
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        if(!IsName(nombre)){
            throw createValidationError('El nombre no es válido', nombre);
        }
        if(!IsParagraph(descripcion)){
            throw createValidationError('La descripción no es válida', descripcion);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1' || estado === true) {
            state = true;
        }
        const gerencia = await Gerencia.findOneAndUpdate({ codigo }, {
            codigo,
            nombre,
            descripcion,
            estado: state
        }, { new: true });
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
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

const updateGerenciaByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        if (total === 0) {
            throw createValidationError('No se enviaron datos', []);
        }

        const { nombre, codigo, descripcion, estado } = req.body;
        if(!IsName(nombre)){
            throw createValidationError('El nombre no es válido', nombre);
        }
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        if(!IsParagraph(descripcion)){
            throw createValidationError('La descripción no es válida', descripcion);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1' || estado === true || estado === 1) {
            state = true;
        }
        const gerencia = await Gerencia.findOneAndUpdate({ nombre }, {
            nombre,
            codigo,
            descripcion,
            estado: state
        }, { new: true });
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
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

const updateStateGerenciaById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, estado } = req.body;
        if (!IsBoolean(estado)) {
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1' || estado === true || estado === 1) {
            state = true;
        }
        const gerencia = await Gerencia.findByIdAndUpdate(id, {
            estado: state
        }, { new: true });
        if (!gerencia) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: gerencia
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
    setGerencia,
    getAllGerencia,
    getGerenciaById,
    getGerenciaByName,
    getGerenciaByCodigo,
    getGerenciaByState,
    updateGerenciaById,
    updateGerenciaByCodigo,
    updateGerenciaByName,
    updateStateGerenciaById
}