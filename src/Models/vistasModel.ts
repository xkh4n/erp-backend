import mongoose from "mongoose";
import { Schema } from "mongoose";
import moment from 'moment-timezone';
import { IVistas } from "../Interfaces";

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

const vistasSchema = new Schema<IVistas>({
    codVista: {
        type: String,
        required: true,
        unique: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        required: true,
        default: true,
    },
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
    },
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

const Vistas = mongoose.model<IVistas>('Vistas', vistasSchema);

export default Vistas;