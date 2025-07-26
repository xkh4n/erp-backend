import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ISubGerencia } from "../Interfaces";

const SubGerenciaSchema = new Schema<ISubGerencia>({
    codigo: {
        type: Number,
        required: true,
        unique: true,
        min: 10,
        max: 99,
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
    },
    gerencia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gerencia'
    }
})

const SubGerencia = mongoose.model<ISubGerencia>('SubGerencia', SubGerenciaSchema);

export default SubGerencia;