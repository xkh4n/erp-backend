import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IVistas } from "../Interfaces";

const vistasSchema = new Schema<IVistas>({
    codigo: {
        type: String,
        required: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    enlace: {
        type: String,
        required: true,
    },
    submenu: {
        type: Boolean,
        required: true,
    },
    vistas: {
        type: [],
        required: false,
    }
})

const Vistas = mongoose.model<IVistas>('Vistas', vistasSchema);

export default Vistas;