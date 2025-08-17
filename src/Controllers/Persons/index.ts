/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Persons Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createValidationError } from "../../Library/Errors/index";

/* INTERFACES */
import {IPersons, IUser} from '../../Interfaces';

/* MODELS */
import Persons from '../../Models/personsModel';
import User from '../../Models/userModel';
import Roles from '../../Models/rolesModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { hashPassword } from '../../Library/Encrypt';

/* VALIDATIONS */
import {  IsIata, IsId, IsISO, IsName } from '../../Library/Validations';


const createPerson = async (req: Request, res: Response): Promise<void> => {
    try {
        const { dni, name, age, birthdate, email01, email02, phone01, phone02, address, state, country, postalCode, username, password, role } = req.body;

        // Verificar si ya existe una persona con este DNI
        const existingPersonByDni = await Persons.findOne({ dni });
        if (existingPersonByDni) {
            logger.warn(`Intento de crear persona con DNI duplicado: ${dni}`);
            throw createValidationError(`Ya existe una persona con este DNI: ${dni}`);
        }

        // Verificar si ya existe un usuario con este username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            logger.warn(`Intento de crear usuario con username duplicado: ${username}`);
            throw createServerError(`Ya existe un usuario con este nombre de usuario: ${username}`);
        }

        // Verificar si ya existe una persona con el email principal
        const existingPersonByEmail = await Persons.findOne({ email01 });
        if (existingPersonByEmail) {
            logger.warn(`Intento de crear persona con email duplicado: ${email01}`);
            throw createValidationError('Ya existe una persona con este email');
        }

        // Verificar si el rol existe y está activo
        const existingRole = await Roles.findOne({ _id: role, isActive: true });
        if (!existingRole) {
            logger.warn(`Intento de asignar rol inexistente o inactivo: ${role}`);
            throw createValidationError(`El rol especificado no existe o está inactivo: ${role}`);
        }

        // Convertir fecha de DD/MM/YYYY a Date object si existe
        let birthdateObj = null;
        if (birthdate) {
            const [day, month, year] = birthdate.split('/');
            birthdateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        // Crear nueva persona
        const newPerson = new Persons({
            dni,
            name,
            age,
            birthdate: birthdateObj,
            email01,
            email02,
            phone01,
            phone02,
            address,
            state,
            country,
            postalCode
        });

        const savedPerson = await newPerson.save();
        logger.info(`Persona creada exitosamente: ${name} (${dni})`);

        // Encriptar contraseña y crear usuario
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            username,
            password: hashedPassword,
            personId: savedPerson._id, // Asegurar que el campo coincida con el modelo User
            role: role,
            isActive: true // Requiere activación
        });

        const savedUser = await newUser.save();
        logger.info(`Usuario creado exitosamente: ${username} con rol: ${existingRole.name}`);

        // Respuesta exitosa
        res.status(201).json({
            codigo: 201,
            message: 'Persona y usuario creados exitosamente',
            data: {
                person: savedPerson,
                user: {
                    id: savedUser._id,
                    username: savedUser.username,
                    role: {
                        id: existingRole._id,
                        name: existingRole.name
                    },
                    isActive: savedUser.isActive
                }
            }
        });

    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        } else {
            const serverError = createServerError('Sucedió un error inesperado al procesar el Role');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
};

export {
    createPerson
};