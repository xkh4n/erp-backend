import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IVistas } from "../Interfaces";

const vistasSchema = new Schema<IVistas>({
    proceso: {
        type: String,
        required: true,
        unique: true,
    },
    label: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    vistas: {
        type: [],
        required: false,
    }
})

const Vistas = mongoose.model<IVistas>('Vistas', vistasSchema);

export default Vistas;