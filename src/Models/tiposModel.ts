import mongoose from "mongoose";
import { ITipo } from "../Interfaces";
const tiposSchema = new mongoose.Schema<ITipo>({
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
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const Tipos = mongoose.model<ITipo>("Tipos", tiposSchema);
export default Tipos;