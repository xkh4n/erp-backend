import { getChileDateTime } from '../Library/Utils/ManageDate';
import mongoose from "mongoose";
import { IKardex } from "../Interfaces/Kardex";

const kardexSchema = new mongoose.Schema<IKardex>({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        unique: true,
        required: true,
        index: true
    },
    movementType: {
        type: String,
        enum: ['entrada', 'salida', 'ajuste'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    date: { type: Date, default: getChileDateTime },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    usuario: {
        type: String,
        trim: true
    },
    balance: {
        type: Number,
        required: true,
        min: 0
    },
    referencia: {
        type: String,
        trim: true
    },
    observaciones: {
        type: String,
        trim: true
    }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

// Índice para optimizar búsquedas por producto, fecha, por tipo de movimiento, por balance y por usuario
kardexSchema.index({ product: 1, date: 1, movementType: 1, balance: 1, usuario: 1 });


const Kardex = mongoose.model<IKardex>('Kardex', kardexSchema);
export default Kardex;