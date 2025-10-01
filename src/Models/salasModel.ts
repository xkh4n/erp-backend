import mongoose from "mongoose";
import { IDependencia } from "../Interfaces";

const dependenciasSchemma = new mongoose.Schema<IDependencia>({
    codigo: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true }
});

const Dependencias = mongoose.model<IDependencia>("Dependencias", dependenciasSchemma);

export default Dependencias;