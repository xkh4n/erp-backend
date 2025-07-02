import mongoose from 'mongoose';
import moment from 'moment-timezone';
import { ISubEstadosActivos } from '../Interfaces';

// Función para obtener fecha en zona horaria de Chile 
function getChileDateTime(): Date {
    // Simplemente crear la fecha en Chile y convertirla directamente
    const chileTime = moment.tz('America/Santiago');
    
    // Obtener los componentes de fecha/hora en Chile
    const year = chileTime.year();
    const month = chileTime.month(); // moment usa 0-11
    const day = chileTime.date();
    const hour = chileTime.hour();
    const minute = chileTime.minute();
    const second = chileTime.second();
    const millisecond = chileTime.millisecond();
    
    // Crear una nueva fecha UTC con los valores de Chile
    return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
}

const subEstadosActivosSchema = new mongoose.Schema<ISubEstadosActivos>({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    codigoestado: { type: Number, required: true }, // Campo autoincrementable
    fechaCreacion: { type: Date, default: getChileDateTime },
    fechaModificacion: { type: Date, default: getChileDateTime },
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

const SubEstadosActivos = mongoose.model<ISubEstadosActivos>('SubEstadosActivos', subEstadosActivosSchema);

export default SubEstadosActivos;
