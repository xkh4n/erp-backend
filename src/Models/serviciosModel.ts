import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IServicio } from "../Interfaces";

const ServicioSchema = new Schema<IServicio>({
    codigo: {
        type: Number,
        required: true,
        unique: true,
        min: 10,
        max: 99,
    },
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        required: true
    },
    departamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Departamentos"
    }
})

const Servicio = mongoose.model<IServicio>("Servicios", ServicioSchema)

export default Servicio