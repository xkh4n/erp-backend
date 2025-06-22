import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IProceso } from "../Interfaces";

const ProcesoSchema = new Schema<IProceso>({
    codigo: {
        type: String,
        required: true,
        unique: true,
        maxlength: 8
    },
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    descripcion: {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        required: true
    },
    servicio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Servicio",
        required: true
    }
})

const Proceso = mongoose.model<IProceso>("Proceso", ProcesoSchema)

export default Proceso