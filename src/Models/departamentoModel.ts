import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IDepartamento } from "../Interfaces";

const DepartamentoSchema = new Schema<IDepartamento>({
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
    subgerencia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubGerencia"
    }
})

const Departamento = mongoose.model<IDepartamento>('Departamento', DepartamentoSchema);

export default Departamento;