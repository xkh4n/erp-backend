import mongoose from "mongoose";
import { IContacto } from "../Interfaces";

// Define the schema for the Contacto model
const contactoSchema = new mongoose.Schema<IContacto>({
    nombre: {
        type: String,
        required: true,
    },
    cargo: {
        type: String,
        required: false, // Optional field for job title
        default: 'No especificado', // Default value if not provided
    },
    telefono01: {
        type: String,
        required: true,
    },
    telefono02: {
        type: String,
        required: false, // Optional second phone number
        default: 'No especificado', // Default value if not provided
    },
    correo01: {
        type: String,
        required: false,
        default: 'No especificado', // Default value if not provided
    },
    correo02: {
        type: String,
        required: false, // Optional second email address
        default: 'No especificado', // Default value if not provided
    },
    proveedorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: true,
    },
    fechaCreacion: {
        type: String,
        required: true,
        default: new Date().toISOString(), // Default to current date in ISO format
    },
    estado: {
        type: Boolean,
        required: true,
        default: true, // Default to active
    },
    tipoContacto: {
        type: String,
        required: false, // Optional field for type of contact
        default: 'primario', // Default value if not provided
    },
    observaciones: {
        type: String,
        required: false, // Optional field for additional notes
        default: 'No especificado', // Default value if not provided
    },
    fechaActualizacion: {
        type: String,
        required: false, // Optional field for last update date
        default: null, // Default to null if not provided
    },
    usuarioActualizacion: {
        type: String,
        required: false, // Optional field for user who last updated
        default: null, // Default to null if not provided
    },
    usuarioCreacion: {
        type: String,
        required: false, // Optional field for user who created the contact
        default: null, // Default to null if not provided
    }
});
const Contacto = mongoose.model<IContacto>('Contacto', contactoSchema);
export default Contacto;