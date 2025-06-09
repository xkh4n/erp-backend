import mongoose from 'mongoose';

export default interface IContacto {
    nombre: string; // Full name of the contact
    cargo?: string; // Job title or position of the contact
    telefono01: string; // Phone number of the contact
    telefono02?: string; // Optional second phone number of the contact
    correo01?: string; // Email address of the contact
    correo02?: string; // Optional second email address of the contact
    proveedorId: mongoose.Schema.Types.ObjectId; // ID of the associated supplier
    fechaCreacion: string; // ISO date string for when the contact was created
    estado: boolean; // true if the contact is active, false if inactive
    tipoContacto?: string; // Type of contact (e.g., "primary", "secondary")
    observaciones?: string; // Optional field for additional notes or comments
    fechaActualizacion?: string; // Optional field for the last update date, ISO date string
    usuarioActualizacion?: string; // Optional field for the user who last updated the contact
    usuarioCreacion?: string; // Optional field for the user who created the contact
}
