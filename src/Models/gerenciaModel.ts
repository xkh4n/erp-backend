import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IGerencia } from "../Interfaces";

const GerenciaSchema = new Schema<IGerencia>({
    codigo: {
        type: Number,
        required: true,
        unique: true,
        min: 10,
        max: 99
    },
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        required: true,
    }
})

const Gerencia = mongoose.model<IGerencia>('Gerencia', GerenciaSchema);
export default Gerencia;