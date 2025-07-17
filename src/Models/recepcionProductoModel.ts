import { getChileDateTime } from '../Library/Utils/ManageDate';
import mongoose from "mongoose";

export interface IRecepcionProducto extends mongoose.Document {
    solicitudId: mongoose.Types.ObjectId;
    detalleSolicitudId: mongoose.Types.ObjectId;
    nroSolicitud: string;
    producto: mongoose.Types.ObjectId;
    numeroSerie: string;
    codigoInventario: number;
    fechaRecepcion: Date;
    fechaCreacion: Date;
    fechaModificacion: Date;
    usuarioRecepcion?: string;
}

const recepcionProductoSchema = new mongoose.Schema<IRecepcionProducto>({
    solicitudId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solicitud',
        required: true,
        index: true
    },
    detalleSolicitudId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DetalleSolicitud',
        required: true,
        index: true
    },
    nroSolicitud: {
        type: String,
        required: true,
        index: true
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
        index: true
    },
    numeroSerie: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true,
        index: true
    },
    codigoInventario: {
        type: Number,
        required: false, // Cambiado a false porque lo asignaremos en el controlador
        unique: true,
        index: true,
        min: 100000000,
        max: 999999999
    },
    fechaRecepcion: {
        type: Date,
        required: true,
        default: getChileDateTime
    },
    fechaCreacion: { 
        type: Date, 
        default: getChileDateTime,
        index: true
    },
    fechaModificacion: { 
        type: Date, 
        default: getChileDateTime 
    },
    usuarioRecepcion: {
        type: String,
        trim: true,
        uppercase: true
    }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion' 
    },
    collection: 'recepciones_productos'
});

// Índices compuestos para mejorar las consultas
recepcionProductoSchema.index({ solicitudId: 1, producto: 1 });
recepcionProductoSchema.index({ nroSolicitud: 1, producto: 1 });
recepcionProductoSchema.index({ fechaRecepcion: -1 });

const RecepcionProducto = mongoose.model<IRecepcionProducto>("RecepcionProducto", recepcionProductoSchema);

export default RecepcionProducto;
