import { getChileDateTime } from '../Library/Utils/ManageDate';
import mongoose from "mongoose";
import { ICategoria } from "../Interfaces";
const tiposSchema = new mongoose.Schema<ICategoria>({
    codigo: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        default: true
    },
    fechaCreacion: { type: Date, default: getChileDateTime },
    fechaModificacion: { type: Date, default: getChileDateTime }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

const Tipos = mongoose.model<ICategoria>("Tipos", tiposSchema);
export default Tipos;