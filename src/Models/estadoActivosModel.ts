import mongoose  from 'mongoose';
import { getChileDateTime } from '../Library/Utils/ManageDate';
import { IEstadosActivos } from '../Interfaces';


const estadoActivosSchema = new mongoose.Schema<IEstadosActivos>({
    codigo: { type: Number, unique: true }, // Campo autoincrementable
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: getChileDateTime },
    fechaModificacion: { type: Date, default: getChileDateTime },
    usuarioCreacion: { type: String, default: 'system' }, // Usuario por defecto
    usuarioModificacion: { type: String, default: 'system' } // Usuario por defecto
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

// Schema para contador
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Función para obtener el siguiente número de secuencia
async function getNextSequence(name: string): Promise<number> {
    const counter = await Counter.findByIdAndUpdate(
        name,
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return counter.sequence_value;
}

// Middleware para autoincremento del código con manejo de concurrencia
estadoActivosSchema.pre('save', async function(next) {
    if (this.isNew && !this.codigo) {
        try {
            this.codigo = await getNextSequence('estadoActivos');
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const EstadoActivos = mongoose.model<IEstadosActivos>('EstadoActivos', estadoActivosSchema);

export default EstadoActivos;
