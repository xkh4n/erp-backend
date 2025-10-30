import mongoose from "mongoose";
import { IProveedor } from "../Interfaces";
const proveedorSchema = new mongoose.Schema<IProveedor>({
    rut: {
        type: String,
        required: true,
        unique: true,
    },
    razonSocial: {
        type: String,
        required: true,
    },
    giro: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    correo: {
        type: String,
        required: true,
    },
    direccion: {
        type: String,
        required: true,
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    contacto: {
        type: String,
        required: true,
    },
    fonoContacto: {
        type: String,
        required: true,
    },
    tipoServicio: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        default: true
    },
    condicionesPago: {
        type: String,
        required: true
    },
    condicionesEntrega: {
        type: String,
        required: true
    },
    condicionesDespacho: {
        type: String,
        required: true
    },
    pais:{
        type:String, 
        required:true
    },
    ciudad:{
        type:String, 
        required:true
    },
    comuna:{
        type:String, 
        required:true
    }
});

// Índices para optimizar consultas
proveedorSchema.index({ fechaCreacion: -1 }); // Para ordenamiento por fecha
proveedorSchema.index({ estado: 1 }); // Para filtros por estado
proveedorSchema.index({ rut: 1 }); // Ya único, pero explícito
proveedorSchema.index({ razonSocial: 1 }); // Para búsquedas por razón social
proveedorSchema.index({ tipoServicio: 1 }); // Para filtros por tipo de servicio
proveedorSchema.index({ pais: 1, ciudad: 1, comuna: 1 }); // Índice compuesto para geografía

// Índice de texto para búsquedas
proveedorSchema.index({ 
    razonSocial: 'text', 
    giro: 'text', 
    contacto: 'text' 
}, {
    name: 'proveedor_text_search',
    weights: {
        razonSocial: 10,
        giro: 5,
        contacto: 3
    }
});

const Proveedor = mongoose.model<IProveedor>("Proveedor", proveedorSchema);
export default Proveedor;