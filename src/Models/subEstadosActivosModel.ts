import mongoose from 'mongoose';
import { ISubEstadosActivos } from '../Interfaces';

const subEstadosActivosSchema = new mongoose.Schema<ISubEstadosActivos>({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    codigoestado: { type: Number, required: true }, // Campo autoincrementable
});

const SubEstadosActivos = mongoose.model<ISubEstadosActivos>('SubEstadosActivos', subEstadosActivosSchema);

export default SubEstadosActivos;
