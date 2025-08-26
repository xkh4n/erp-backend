import mongoose from "mongoose";
import { ICentroCostos } from "../Interfaces";
import { getChileDateTime } from "../Library/Utils/ManageDate";

const CentroCostosSchema = new mongoose.Schema<ICentroCostos>({
    codigo: { 
        type: String, 
        required: [true, 'El código es requerido'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [20, 'El código no puede exceder 20 caracteres']
    },
    nombre: { 
        type: String, 
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    descripcion: { 
        type: String, 
        required: [true, 'La descripción es requerida'],
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    fechaCreacion: { type: Date, default: Date.now },
    fechaModificacion: { type: Date, default: Date.now }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

// Índices para mejorar rendimiento
CentroCostosSchema.index({ nombre: 1 });
CentroCostosSchema.index({ fechaCreacion: -1 });

// Middleware pre-save para asegurar que el código esté en mayúsculas
CentroCostosSchema.pre('save', function(next) {
    if (this.codigo) {
        this.codigo = this.codigo.toUpperCase();
    }
    next();
});

// Middleware pre-findOneAndUpdate para asegurar que el código esté en mayúsculas
CentroCostosSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate() as any;
    if (update.codigo) {
        update.codigo = update.codigo.toUpperCase();
    }
    next();
});

const CentroCostos = mongoose.model<ICentroCostos>("CentroCostos", CentroCostosSchema);

export default CentroCostos;
