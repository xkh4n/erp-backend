/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Departamento Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IDepartamento } from '../../Interfaces';

/* MODELS */
import Departamento from '../../Models/departamentoModel';
import SubGerencia from '../../Models/subgerenciaModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsNameDepto, IsParagraph, IsBoolean, IsId } from '../../Library/Validations';
import gerencia from '../../Routes/Gerencias/index';
import subgerencia from '../../Routes/SubGerencia/index';

const setDepartamento = async (req: Request, res: Response): Promise<void> => {
    try {
        const total = Object.keys(req.body).length;
        const promise: Promise<IDepartamento>[] = [];
        for (let i = 0; i < total; i++) {
            const { codigo, nombre, descripcion, subgerencia } = req.body[i];
            if (!IsCodGerencia(codigo)) {
                throw createValidationError('El código del departamento debe estar entre 10 y 99', codigo);
            }
            if (!IsNameDepto(nombre)) {
                throw createValidationError('El nombre del departamento debe tener entre 3 y 50 caracteres', nombre);
            }
            if (!IsParagraph(descripcion)) {
                throw createValidationError('La descripción del departamento debe tener entre 3 y 200 caracteres', descripcion);
            }
            const fibdSubGerencia = await SubGerencia.findOne({ codigo:subgerencia });
            if(!fibdSubGerencia){
                throw createNotFoundError('No existe una sub-gerencia con ese código', subgerencia);
            }
            const newDepartamento = new Departamento({
                codigo,
                nombre,
                descripcion,
                estado: true,
                subgerencia: fibdSubGerencia._id
            });
            
            try {
                await newDepartamento.save();
                promise.push(Promise.resolve(newDepartamento));
            } catch (error: any) {
                if (error.code === 11000) {
                    throw createConflictError('Ya existe un departamento con ese código', {"codigo":codigo,"nombre":nombre});
                }
                throw createServerError('Sucedió un error Inesperado', {"codigo":codigo,"nombre":nombre});
            }
        }
        
        const depto = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: depto
        });
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const getAllDepartamentos = async (req: Request, res: Response): Promise<void> => {
    try {
        const departamentos = await Departamento.find({ estado: true });
        if(!departamentos){
            throw createNotFoundError('No existen departamentos');
        }
        res.status(200).json({
            codigo: 200,
            data: departamentos
        });
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const getDepartamentoById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        const departamento = await Departamento.findById(id);
        if(!departamento){
            throw createNotFoundError('No existe un departamento con ese código');
        }
        res.status(200).json({
            codigo: 200,
            data: departamento
        })
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const getDepartamentoByIdSubGerencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        const departamento = await Departamento.find({ subgerencia: id });
        if(!departamento){
            throw createNotFoundError('No existe un departamento con ese código');
        }
        res.status(200).json({
            codigo: 200,
            data: departamento
        })
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const getDepartamentoByCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { codigo } = req.body;
        const departamento = await Departamento.findOne({ codigo: codigo });
        if(!departamento){
            throw createNotFoundError('No existe un departamento con ese código');
        }
        res.status(200).json({
            codigo: 200,
            data: departamento
        })
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const getDepartamentoByCodigoSubGerencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { codigo } = req.body;
        if(!IsCodGerencia(codigo)){
            throw createValidationError('El código del departamento debe estar entre 10 y 99', codigo);
        }
        const subgerencia = await SubGerencia.findOne({ codigo: codigo });
        if(!subgerencia){
            throw createNotFoundError('No existe una sub-gerencia con ese código', codigo);
        }
        const departamento = await Departamento.find({ subgerencia: subgerencia._id });
        if(!departamento){
            throw createNotFoundError('No existe un departamento con ese código');
        }
        res.status(200).json({
            codigo: 200,
            data: departamento
        })
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const updateDepartamentoById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, codigo, nombre, descripcion, subgerencia, estado } = req.body;
        if(!IsId(id)){
            throw createValidationError('El id no es válido', id);
        }
        const departamento = await Departamento.findById(id);
        if(!departamento){
            throw createNotFoundError('No existe un departamento con ese código');
        }
        if (!IsCodGerencia(codigo)) {
            throw createValidationError('El código del departamento debe estar entre 10 y 99', codigo);
        }
        if (!IsNameDepto(nombre)) {
            throw createValidationError('El nombre del departamento debe tener entre 3 y 50 caracteres', nombre);
        }
        if (!IsParagraph(descripcion)) {
            throw createValidationError('La descripción del departamento debe tener entre 3 y 200 caracteres', descripcion);
        }
        const fibdSubGerencia = await SubGerencia.findOne({ codigo:subgerencia });
        if(!fibdSubGerencia){
            throw createNotFoundError('No existe una sub-gerencia con ese código', subgerencia);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }

        const newDepartamento = await Departamento.findByIdAndUpdate(id, {
            codigo,
            nombre,
            descripcion,
            estado: estado,
            subgerencia: fibdSubGerencia._id
        }, { new: true });
        if (!newDepartamento) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: newDepartamento
        })
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

const updateDepartamentoByCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { codigo, nombre, descripcion, subgerencia, estado } = req.body;
        if (!IsCodGerencia(codigo)) {
            throw createValidationError('El código del departamento debe estar entre 10 y 99', codigo);
        }
        if (!IsNameDepto(nombre)) {
            throw createValidationError('El nombre del departamento debe tener entre 3 y 50 caracteres', nombre);
        }
        if (!IsParagraph(descripcion)) {
            throw createValidationError('La descripción del departamento debe tener entre 3 y 200 caracteres', descripcion);
        }
        const fibdSubGerencia = await SubGerencia.findOne({ codigo:subgerencia });
        if(!fibdSubGerencia){
            throw createNotFoundError('No existe una sub-gerencia con ese código', subgerencia);
        }
        if (!IsBoolean(estado)){
            throw createValidationError('El estado no es válido', estado);
        }
        let state = false;
        if (estado === 'true' || estado === '1'){
            state = true;
        }
        const newDepartamento = await Departamento.findOneAndUpdate({ codigo: codigo }, {
            nombre,
            descripcion,
            estado: state,
            subgerencia: fibdSubGerencia._id
        }, { new: true });
        if (!newDepartamento) {
            throw createNotFoundError('No se encontró la gerencia');
        }
        res.status(200).json({
            codigo: 200,
            data: newDepartamento
        })
    } catch (error) {
        logger.error('Error en setDepartamento:', error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
            return;
        }
        const serverError = createServerError('Sucedió un error Inesperado');
        res.status(serverError.code).json(serverError.toJSON());
    }
}

export {
    setDepartamento,
    getAllDepartamentos,
    getDepartamentoById,
    getDepartamentoByIdSubGerencia,
    getDepartamentoByCodigo,
    getDepartamentoByCodigoSubGerencia,
    updateDepartamentoById,
    updateDepartamentoByCodigo
};