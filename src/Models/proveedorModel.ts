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

const Proveedor = mongoose.model<IProveedor>("Proveedor", proveedorSchema);
export default Proveedor;