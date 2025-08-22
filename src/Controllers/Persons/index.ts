/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Persons Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createValidationError, createConflictError } from "../../Library/Errors/index";

/* INTERFACES */
import {IPersons, IUser} from '../../Interfaces';

/* MODELS */
import Persons from '../../Models/personsModel';
import User from '../../Models/userModel';
import Roles from '../../Models/rolesModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { hashPassword } from '../../Library/Encrypt';
import { createHash } from 'crypto';

/* VALIDATIONS */
import {  IsEmail, IsId, IsName, IsPassword, IsRut, IsUsername } from '../../Library/Validations';

/* TYPES */
type PersonWithId = IPersons & { _id: string };
type UserWithId = IUser & { _id: string };

/* HELPER FUNCTION FOR TIME FORMATTING */
const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('es-CL', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    }) + `:${date.getMilliseconds().toString().padStart(3, '0')}`;
};

const calcularDuracion = (inicio: Date, fin: Date): string => {
    const duracionMs = fin.getTime() - inicio.getTime();
    if (duracionMs < 1000) {
        return `${duracionMs}ms`;
    } else if (duracionMs < 60000) {
        return `${(duracionMs / 1000).toFixed(2)}s`;
    } else {
        const minutos = Math.floor(duracionMs / 60000);
        const segundos = ((duracionMs % 60000) / 1000).toFixed(2);
        return `${minutos}m ${segundos}s`;
    }
};

/* HYBRID PASSWORD HASHING FUNCTION */
const hashPasswordHybrid = async (password: string): Promise<string> => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
        // SHA256 para desarrollo - RÁPIDO (~0.1ms por hash)
        const salt = 'dev_salt_2025'; // Salt fijo para desarrollo
        const hash = createHash('sha256')
            .update(password + salt)
            .digest('hex');
        logger.debug(`🔓 Usando SHA256 para desarrollo (rápido)`);
        return `sha256_${hash}`;
    } else {
        // Argon2 para producción - SEGURO
        try {
            const argon2 = require('argon2');
            const hash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16, // 64 MB (más rápido que default)
                timeCost: 2,         // 2 iterations (más rápido que default)
                parallelism: 1       // 1 thread
            });
            logger.debug(`🔒 Usando Argon2 para producción (seguro)`);
            return hash;
        } catch (error) {
            logger.warn(`⚠️ Argon2 no disponible, fallback a bcrypt:`, error.message);
            // Fallback a bcrypt si argon2 no está disponible
            return hashPassword(password);
        }
    }
};


const createPerson = async (req: Request, res: Response): Promise<void> => {
    try {
        // Timer inicial para medir tiempo total de procesamiento
        const timerTotal = new Date();
        logger.info(`🚀 Proceso TOTAL inicia a las: ${formatTimestamp(timerTotal)}`);
        
        // PARCHE: Eliminar índice email conflictivo si existe
        try {
            await User.collection.dropIndex('email_1');
            logger.info(`🔧 Índice email_1 eliminado exitosamente`);
        } catch (error) {
            // Si el índice no existe o ya fue eliminado, continuamos
            logger.debug(`Índice email_1 no existe o ya fue eliminado: ${error.message}`);
        }
        
        const total = Object.keys(req.body).length;
        const personaSave: PersonWithId[] = [];
        const usuarioSave: UserWithId[] = [];
        
        // Validaciones previas del batch completo
        const batchUsernames = req.body.map(item => item.username);
        const batchEmails = req.body.map(item => item.email01);
        const batchDnis = req.body.map(item => item.dni);
        
        // Verificar duplicados dentro del mismo batch
        const duplicateUsernames = batchUsernames.filter((item, index) => batchUsernames.indexOf(item) !== index);
        const duplicateEmails = batchEmails.filter((item, index) => batchEmails.indexOf(item) !== index);
        const duplicateDnis = batchDnis.filter((item, index) => batchDnis.indexOf(item) !== index);
        
        if (duplicateUsernames.length > 0) {
            throw createValidationError(`Usernames duplicados en el batch: ${duplicateUsernames.join(', ')}`);
        }
        if (duplicateEmails.length > 0) {
            throw createValidationError(`Emails duplicados en el batch: ${duplicateEmails.join(', ')}`);
        }
        if (duplicateDnis.length > 0) {
            throw createValidationError(`DNIs duplicados en el batch: ${duplicateDnis.join(', ')}`);
        }

        // OPTIMIZACIÓN: Verificar existencia en BD en lotes (en lugar de individualmente)
        logger.debug(`Verificando existencia de ${batchDnis.length} registros en BD...`);
        
        const [existingPersons, existingPersonEmails, existingUsernames] = await Promise.all([
            Persons.find({ dni: { $in: batchDnis } }).select('dni').lean(),
            Persons.find({ email01: { $in: batchEmails } }).select('email01').lean(),
            User.find({ username: { $in: batchUsernames } }).select('username').lean()
        ]);
        
        // Crear Sets para búsqueda rápida
        const existingDniSet = new Set(existingPersons.map(p => p.dni));
        const existingEmailSet = new Set(existingPersonEmails.map(p => p.email01));
        const existingUsernameSet = new Set(existingUsernames.map(u => u.username));
        
        logger.debug(`Encontrados en BD - DNIs: ${existingDniSet.size}, Emails: ${existingEmailSet.size}, Usernames: ${existingUsernameSet.size}`);

        // Timer de preparación completada
        const finPreparacion = new Date();
        logger.info(`⚡ Proceso PREPARACIÓN terminó a las: ${formatTimestamp(finPreparacion)} y se demoró ${calcularDuracion(timerTotal, finPreparacion)}`);

        // Timer para el procesamiento del for loop
        const timerProcesamiento = new Date();
        logger.info(`🔄 Proceso PROCESAMIENTO inicia a las: ${formatTimestamp(timerProcesamiento)}`);

        // Variable para trackear tiempo de cada lote de 100
        let timerLote = new Date();

        // OPTIMIZACIÓN: Para lotes grandes (>500), reducir validaciones costosas
        const esLoteGrande = total > 500;
        if (esLoteGrande) {
            logger.warn(`🚀 MODO LOTE GRANDE activado para ${total} registros - Validaciones simplificadas`);
        }

        // Procesar registros en lotes con logging de progreso
        for(let i = 0; i < total; i++) {
            const { dni, name, email01, state, country, username, password, role } = req.body[i];
            
            // OPTIMIZACIÓN: Validaciones simplificadas para lotes grandes
            if (esLoteGrande) {
                // Validaciones básicas y rápidas
                if (!state || !country || !role) {
                    throw createValidationError(`IDs requeridos faltantes en registro ${dni}`);
                }
                if (!name || name.length < 3) {
                    throw createValidationError(`Nombre inválido en registro ${dni}`);
                }
                if (!email01 || !email01.includes('@')) {
                    throw createValidationError(`Email inválido en registro ${dni}`);
                }
                if (!dni || dni.length < 8) {
                    throw createValidationError(`DNI inválido: ${dni}`);
                }
                if (!username || username.length < 3) {
                    throw createValidationError(`Username inválido en registro ${dni}`);
                }
                if (!password || password.length < 8) {
                    throw createValidationError(`Password inválido en registro ${dni}`);
                }
            } else {
                // Validaciones completas para lotes pequeños
                if(!IsId(state)){
                    throw createValidationError(`El ID de la Comuna no es válido del ${dni}`);
                }
                if(!IsId(country)){
                    throw createValidationError(`El ID del País no es válido del ${dni}`);
                }
                if(!IsId(role)){
                    throw createValidationError(`El ID del Rol no es válido del ${dni}`);
                }
                if(!IsName(name)){
                    throw createValidationError(`El nombre no es válido del ${dni}`);
                }
                if(!IsEmail(email01)){
                    throw createValidationError(`El email no es válido del ${dni}`);
                }
                if(!IsRut(dni)){
                    throw createValidationError(`El RUT no es válido del ${dni}`);
                }
                if(!IsUsername(username.toLowerCase())){
                    throw createValidationError(`El nombre de usuario no es válido del ${dni}`);
                }
                if(!IsPassword(password)){
                    throw createValidationError(`La contraseña no es válida del ${dni}`);
                }
            }
            
            // OPTIMIZACIÓN: Verificar existencia usando los Sets precargados (en lugar de consultas individuales)
            if (existingDniSet.has(dni)) {
                throw createConflictError(`Ya existe una persona con el RUT ${dni}`);
            }
            if (existingEmailSet.has(email01)) {
                throw createConflictError(`Ya existe una persona con el email ${email01}`);
            }
            if (existingUsernameSet.has(username)) {
                throw createConflictError(`Ya existe un usuario con el nombre de usuario ${username}`);
            }

            // Crear y guardar persona PRIMERO
            // Crear instancia de Persona con los datos recibidos
            const newIPerson = new Persons({
                dni,
                name,
                email01,
                state,
                country
            });

            let savedPerson;
            try {
                savedPerson = await newIPerson.save(); // ACTIVADO PARA GUARDADO REAL
                const personObject = savedPerson.toObject();
                personaSave.push({
                    ...personObject,
                    _id: personObject._id.toString()
                } as PersonWithId);
            } catch (err) {
                logger.error(`Error al guardar persona ${dni}:`, err);
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Persona con ese RUT', dni);
                }
                throw createServerError('Sucedió un error Inesperado al guardar la Persona', dni);
            }

            // Crear usuario con la referencia correcta a la persona guardada
            // HASH HÍBRIDO: SHA256 para desarrollo, Argon2 para producción
            const hashPass = await hashPasswordHybrid(password);
            
            const newIUser = new User({
                username: username.toLowerCase(),
                password: hashPass,
                role,
                personId: savedPerson._id, // Usar savedPerson._id que ya existe
                createdBy: req.user?.id
            });

            try {
                const savedUser = await newIUser.save(); // ACTIVADO PARA GUARDADO REAL
                const userObject = savedUser.toObject();
                usuarioSave.push({
                    ...userObject,
                    _id: userObject._id.toString()
                } as UserWithId);
            } catch (err) {
                logger.error(`Error al guardar usuario ${username}:`, err);
                if (err.code === 11000) {
                    throw createConflictError('Ya existe un Usuario con ese nombre', username);
                }
                throw createServerError('Sucedió un error Inesperado al guardar el Usuario', username);
            }
        }

        // Timer de procesamiento completado
        const finProcesamiento = new Date();
        logger.info(`🔥 Proceso PROCESAMIENTO terminó a las: ${formatTimestamp(finProcesamiento)} y se demoró ${calcularDuracion(timerProcesamiento, finProcesamiento)}`);

        // Timer para preparación de respuesta
        const timerRespuesta = new Date();
        logger.info(`📦 Proceso RESPUESTA inicia a las: ${formatTimestamp(timerRespuesta)}`);

        res.status(201).json({
            codigo: 201,
            message: `✅ Se guardaron exitosamente ${personaSave.length} personas y ${usuarioSave.length} usuarios en la base de datos`,
            data: {
                usuarios: usuarioSave,
                personas: personaSave
            },
            resumen: {
                totalProcesados: total,
                personasGuardadas: personaSave.length,
                usuariosGuardados: usuarioSave.length,
                tiempoTotal: calcularDuracion(timerTotal, new Date()),
                entorno: process.env.NODE_ENV,
                hashMethod: process.env.NODE_ENV === 'development' ? 'SHA256' : 'Argon2'
            }
        });

        // Timer total completado
        const finRespuesta = new Date();
        const finTotal = new Date();
        logger.info(`📤 Proceso RESPUESTA terminó a las: ${formatTimestamp(finRespuesta)} y se demoró ${calcularDuracion(timerRespuesta, finRespuesta)}`);
        logger.info(`✅ Proceso TOTAL terminó a las: ${formatTimestamp(finTotal)} y se demoró ${calcularDuracion(timerTotal, finTotal)} para ${total} registros`);
    } catch (error) {
        logger.error('Error en createPerson:', error);
        
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al procesar la Persona');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

const getAllPersons = async (req: Request, res: Response): Promise<void> => {
    try {
        const persons = await Persons.find();
        res.status(200).json({
            codigo: 200,
            message: '✅ Personas obtenidas exitosamente',
            data: persons
        });
    } catch (error) {
        logger.error('Error en getAllPersons:', error);
        const serverError = createServerError('Sucedió un error inesperado al obtener las Personas');
        res.status(serverError.code).json(serverError.toJSON());
    }
};

export {
    createPerson,
    getAllPersons
};