import mongoose  from 'mongoose';
import { IEstadosActivos } from '../Interfaces';

const estadoActivosSchema = new mongoose.Schema<IEstadosActivos>({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true }
});

const EstadoActivos = mongoose.model<IEstadosActivos>('EstadoActivos', estadoActivosSchema);

export default EstadoActivos;
