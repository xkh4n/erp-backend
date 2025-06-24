/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Proveedor Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IProveedor, IContacto } from '../../Interfaces';

/* MODELS */
import Proveedor from '../../Models/proveedorModel';
import Contacto from '../../Models/contactoModel';

/* DEPENDENCIES */
import { Request, Response } from "express";
import { IsCodGerencia, IsName, IsParagraph, IsProceso, IsBoolean, IsId, IsRut, IsPhone, IsIata, IsEmail } from '../../Library/Validations';

/**
 * @description Create a new supplier
 * @param req - Express request object
 * @param res - Express response object
 */
const createProveedor = async (req: Request, res: Response): Promise<void> => {
    try {
        const promise: Promise<IProveedor>[] = [];
        const { 
            rut, razonSocial, giro, telefono, correo, direccion, 
            contacto, fonoContacto, tipoServicio, estado, condicionesPago, 
            condicionesEntrega, condicionesDespacho, pais, ciudad, comuna 
        } = req.body;

        // Validate required fields
        if (!rut || !razonSocial || !giro || !telefono || !correo || !direccion || !contacto || !fonoContacto || !tipoServicio || !condicionesPago || !condicionesEntrega || !condicionesDespacho || !pais || !ciudad || !comuna) {
            throw createValidationError('All fields are required');
        }

        // Validate field formats
        if (!IsRut(rut)) throw createValidationError('Invalid RUT format');
        if (!IsParagraph(razonSocial)) throw createValidationError('Invalid Razon Social format');
        if (!IsParagraph(giro)) throw createValidationError('Invalid Giro format');
        if (!IsPhone(telefono)) throw createValidationError('Invalid Telefono format');
        if (!IsEmail(correo)) throw createValidationError('Invalid Correo format');
        if (!IsParagraph(direccion)) throw createValidationError('Invalid Direccion format');
        if (!IsName(contacto)) throw createValidationError('Invalid Contacto format');
        if (!IsPhone(fonoContacto)) throw createValidationError('Invalid Fono Contacto format');
        if (!IsParagraph(tipoServicio)) throw createValidationError('Invalid Tipo Servicio format');
        if (!IsBoolean(estado)) throw createValidationError('Estado must be a boolean value');
        if (!IsParagraph(condicionesPago)) throw createValidationError('Invalid Condiciones Pago format');
        if (!IsParagraph(condicionesEntrega)) throw createValidationError('Invalid Condiciones Entrega format');
        if (!IsParagraph(condicionesDespacho)) throw createValidationError('Invalid Condiciones Despacho format');
        if (!IsIata(pais)) throw createValidationError('Invalid Pais format');
        if (!IsIata(ciudad)) throw createValidationError('Invalid Ciudad format');
        if (!IsId(comuna)) throw createValidationError('Invalid Comuna format');

        // Create new supplier
        const newProveedor = new Proveedor({
            rut,
            razonSocial,
            giro,
            telefono,
            correo,
            direccion,
            contacto,
            fonoContacto,
            tipoServicio,
            estado,
            condicionesPago,
            condicionesEntrega,
            condicionesDespacho,
            pais,
            ciudad,
            comuna
        });
        try {
            await newProveedor.save();
            promise.push(Promise.resolve(newProveedor));
            try {
                const newContacto = new Contacto( {
                    nombre: contacto,
                    telefono01: fonoContacto,
                    proveedorId: newProveedor._id,
                    fechaCreacion: new Date().toISOString(),
                    estado: true
                });
                await newContacto.save();
            } catch (err) {
                if (err.code === 11000) {
                    throw createConflictError('Ya existe una Contacto con este Nombre', contacto);
                }
                throw createServerError('Sucedió un error Inesperado al guardar en Contacto', contacto);
            }
        } catch (err) {
            if (err.code === 11000) {
                throw createConflictError('Ya existe un Proveedor con esa Razon Social', razonSocial);
            }
            throw createServerError('Sucedió un error Inesperado al guardar la Proveedor', razonSocial);
        }
        const supplier = await Promise.all(promise);
        res.status(201).json({
            message: 'Proveedor creado Exitosamente',
            data: supplier
        });
    }  catch (error) {
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
    createProveedor,
}