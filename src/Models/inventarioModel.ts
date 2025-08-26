import { getChileDateTime } from '../Library/Utils/ManageDate';
import mongoose from "mongoose";

import { IInventory, ValidityType } from '../Interfaces/Inventario/index'

const inventarioSchema = new mongoose.Schema<IInventory>({
    inventoryCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        uppercase: true
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
        index: true
    },
    serialNumber: {
        type: String,
        trim: true,
        uppercase: true,
        unique: true,
        index: true
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubEstadosActivos',
        required: true
    },
    centroCosto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CentroCosto',
        required: true,
        index: true
    },
    // Campos de recepción
    nroSolicitud: {
        type: String,
        trim: true,
        index: true
    },
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        index: true
    },
    tipoDocumento: {
        type: String,
        trim: true,
        enum: ['GUIA DESPACHO', 'FACTURA', 'ORDEN DE RETIRO', 'ORDEN DE TRANSPORTE']
    },
    numeroDocumento: {
        type: String,
        trim: true,
        uppercase: true
    },
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validityValue: {
        type: Number,
        min: 0
    },
    validityType: {
        type: String,
        enum: Object.values(ValidityType)
    },
    expirationDate:{
        type: Date,
        default: getChileDateTime
    },
    value: Number,
    location: String,
    createdAt: {
        type: Date,
        default: getChileDateTime
    },
    updatedAt: {
        type: Date,
        default: getChileDateTime
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: getChileDateTime
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}, {
    timestamps: { 
        createdAt: 'createdAt', 
        updatedAt: 'updatedAt',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

// Índices para optimizar búsquedas
inventarioSchema.index({ status: 1 });
inventarioSchema.index({ assignedUser: 1 });
inventarioSchema.index({ tipoDocumento: 1 });


// Middleware para calcular la fecha de vencimiento antes de guardar
inventarioSchema.pre('save', function(next) {
    if (this.validityValue && this.validityType && this.createdAt) {
        const createdAt = new Date(this.createdAt);
        // Calcular la fecha de vencimiento según el tipo de vigencia
        switch(this.validityType) {
            case 'dias':
                createdAt.setDate(createdAt.getDate() + this.validityValue);
                break;
            case 'meses':
                createdAt.setMonth(createdAt.getMonth() + this.validityValue);
                break;
            case 'años':
                createdAt.setFullYear(createdAt.getFullYear() + this.validityValue);
                break;
            default:
                this.expirationDate = undefined;
                next();
                return;
        }

        this.expirationDate = createdAt;
    } else {
        this.expirationDate = undefined;
    }
    
    next();
});

const Inventario = mongoose.model<IInventory>('Inventario', inventarioSchema);

export default Inventario;