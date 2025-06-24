import mongoose from 'mongoose';
import { ISubEstadosActivos } from '../Interfaces';

const subEstadosActivosSchema = new mongoose.Schema<ISubEstadosActivos>({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    estadoActivo: { type: mongoose.Schema.Types.ObjectId, ref: 'EstadoActivos', required: true }
});

const SubEstadosActivos = mongoose.model<ISubEstadosActivos>('SubEstadosActivos', subEstadosActivosSchema);

export default SubEstadosActivos;
