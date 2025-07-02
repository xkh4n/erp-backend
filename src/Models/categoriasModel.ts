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
    }
}, {
    timestamps: true
});

const Tipos = mongoose.model<ICategoria>("Tipos", tiposSchema);
export default Tipos;