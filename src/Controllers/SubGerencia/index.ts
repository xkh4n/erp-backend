/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Sub-Gerencia Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { ISubGerencia } from '../../Interfaces';

/* MODELS */
import SubGerencia from '../../Models/subgerenciaModel';
import Gerencia from '../../Models/gerenciaModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsBoolean, IsCodGerencia, IsName, IsParagraph, IsId, IsNameDepto } from '../../Library/Validations';


const setSubGerencia = async (req: Request, res: Response) : Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        let promise: Promise<ISubGerencia>[] = [];
        let state = false;
        for (let i = 0; i < total; i++) {
            const {codigo, nombre, descripcion, gerencia, estado} = req.body[i];
            if(!IsParagraph(nombre)){
                throw createValidationError('El nombre no es válido', nombre);
            }
            if(!IsCodGerencia(codigo)){
                throw createValidationError('El código no es válido', codigo);
            }
            if(!IsParagraph(descripcion)){
                throw createValidationError('La descripción no es válida', descripcion);
            }
            if(!IsBoolean(estado)){
                throw createValidationError('El estado no es válido', estado);
            }
            if (estado === 'true' || estado === '1'){
                state = true;
            }
            const fibdGerencia = await Gerencia.findOne({codigo: Number(gerencia)});
            if(!fibdGerencia){
                throw createNotFoundError('No existe una gerencia con ese código', gerencia);
            }
            const newSubGerencia = new SubGerencia({
                codigo,
                nombre,
                descripcion,
                estado: state,
                gerencia: fibdGerencia._id
            });
            try {
                await newSubGerencia.save();
                promise.push(Promise.resolve(newSubGerencia));
            } catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Subgerencia con ese código', codigo);
                }
                throw createServerError('Sucedió un error Inesperado al guardar la Subgerencia', nombre);
            }
        }
        const subgerencia = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: subgerencia
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

const getAllSubGerencia = async (req: Request, res: Response) : Promise<void> => {
    try {
        const subgerencia = await SubGerencia.find({});
        if(!subgerencia){
            throw createNotFoundError('No existen Subgerencias');
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const getSubGerenciaById = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {id} = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        const subgerencia = await SubGerencia.findById(id);
        if(!subgerencia){
            throw createNotFoundError('No existe una Subgerencia con ese id', id);
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const getSubGerenciaByCodigo = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {codigo} = req.body;
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        const subgerencia = await SubGerencia.findOne({codigo});
        if(!subgerencia){
            throw createNotFoundError('No existe una Subgerencia con ese código', codigo);
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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


const getSubGciaByEstado = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {estado} = req.body;
        if(!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1' || estado === true || estado === 1){
            state = true;
        }
        const subgerencia = await SubGerencia.find({estado: state});
        if(!subgerencia){
            throw createNotFoundError('No existen Subgerencias con ese estado', estado);
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const getSubGerenciaByIdGerencia = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {gerencia} = req.body;
        if(!IsId(gerencia)){
            throw createValidationError('El id de la gerencia no es válido', gerencia);
        }
        const subgerencia = await SubGerencia.find({gerencia});
        if(!subgerencia){
            throw createNotFoundError('No existe una Subgerencia con ese id de gerencia', gerencia);
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const getSubGerenciaByCodigoGerencia = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {gerencia} = req.body;
        if(!IsCodGerencia(gerencia)){
            throw createValidationError('El código de la gerencia no es válido', gerencia);
        }
        const gerenciaFind = await Gerencia.findOne({codigo: Number(gerencia)});
        if(!gerenciaFind){
            throw createNotFoundError('No existe una Gerencia con ese código', gerencia);
        }
        const subgerencia = await SubGerencia.find({gerencia: gerenciaFind._id});
        if(!subgerencia){
            throw createNotFoundError('No existe una Subgerencia con ese código de gerencia', gerencia);
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const updateSubGerenciaById = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {id, codigo, nombre, descripcion, gerencia, estado} = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        if(!IsNameDepto(nombre)){
            throw createValidationError('El nombre no es válido', nombre);
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
        const gerenciaFind = await Gerencia.findOne({codigo: Number(gerencia)});
        if(!gerenciaFind){
            throw createNotFoundError('No existe una Gerencia con ese código', gerencia);
        }
        const subgerencia = await SubGerencia.findByIdAndUpdate(id, {
            codigo,
            nombre,
            descripcion,
            estado: state,
            gerencia: gerenciaFind._id
        })
        if (!subgerencia) {
            throw createNotFoundError('No se encontró la Subgerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const updateSubGerenciaByCodigo = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {codigo, nombre, descripcion, gerencia, estado} = req.body;
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código no es válido', codigo);
        }
        if(!IsNameDepto(nombre)){
            throw createValidationError('El nombre no es válido', nombre);
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
        const gerenciaFind = await Gerencia.findOne({codigo: Number(gerencia)});
        if(!gerenciaFind){
            throw createNotFoundError('No existe una Gerencia con ese código', gerencia);
        }
        const subgerencia = await SubGerencia.findOneAndUpdate({ codigo }, {
            codigo,
            nombre,
            descripcion,
            estado: state,
            gerencia: gerenciaFind._id
        })
        if (!subgerencia) {
            throw createNotFoundError('No se encontró la Subgerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

const updateStateById = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { id, estado } = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1' || estado === true || estado === 1){
            state = true;
        }
        const subgerencia = await SubGerencia.findByIdAndUpdate(id, {
            estado: state
        })
        if (!subgerencia) {
            throw createNotFoundError('No se encontró la Subgerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: subgerencia
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

export{
    setSubGerencia,
    getAllSubGerencia,
    getSubGerenciaById,
    getSubGerenciaByCodigo,
    getSubGciaByEstado,
    getSubGerenciaByIdGerencia,
    getSubGerenciaByCodigoGerencia,
    updateSubGerenciaById,
    updateSubGerenciaByCodigo,
    updateStateById
}