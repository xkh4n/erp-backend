import { getChileDateTime } from '../Library/Utils/ManageDate';
import mongoose from "mongoose";
import { IDetalleSolicitud } from "../Interfaces/Detalles/index";

const detalleSolicitudSchema = new mongoose.Schema<IDetalleSolicitud>({
    nroSolicitud: {
        type: String,
        required: true,
        index: true
    },
    solicitudId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solicitud',
        required: true,
        index: true
    },
    tipoEquipamiento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tipos', // Referencia al modelo de categorías
        required: true,
        index: true
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
        index: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad debe ser un número entero'
        }
    },
    cantidadAprobada: {
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad aprobada debe ser un número entero'
        }
    },
    cantidadEntregada: {
        type: Number,
        min: 0,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad entregada debe ser un número entero'
        }
    },
    precioEstimado: {
        type: Number,
        min: 0
    },
    precioReal: {
        type: Number,
        min: 0
    },
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobado', 'rechazado', 'parcial', 'entregado'],
        default: 'pendiente',
        index: true
    },
    fechaEntrega: {
        type: Date
    },
    observacionesDetalle: {
        type: String,
        maxlength: 300,
        trim: true,
        uppercase: true
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
    numeroSerie: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true // Permite múltiples valores null pero únicos cuando tienen valor
    },
    codigoInventario: {
        type: String,
        trim: true,
        uppercase: true,
        unique: true,
        sparse: true
    },
    garantia: {
        meses: {
            type: Number,
            min: 0,
            max: 120 // Máximo 10 años
        },
        fechaVencimiento: {
            type: Date
        },
        proveedor: {
            type: String,
            trim: true,
            uppercase: true
        }
    }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices compuestos para optimizar consultas
detalleSolicitudSchema.index({ solicitudId: 1, estado: 1 });
detalleSolicitudSchema.index({ nroSolicitud: 1, tipoEquipamiento: 1 });
detalleSolicitudSchema.index({ producto: 1, estado: 1 });
detalleSolicitudSchema.index({ fechaCreacion: -1, estado: 1 });
detalleSolicitudSchema.index({ proveedor: 1, fechaEntrega: 1 });

// Virtual para calcular el valor total del detalle
detalleSolicitudSchema.virtual('valorTotal').get(function() {
    if (this.precioReal && this.cantidadEntregada) {
        return this.precioReal * this.cantidadEntregada;
    }
    if (this.precioEstimado && this.cantidadAprobada) {
        return this.precioEstimado * this.cantidadAprobada;
    }
    return 0;
});

// Virtual para verificar si está completamente entregado
detalleSolicitudSchema.virtual('entregaCompleta').get(function() {
    return this.cantidadEntregada >= (this.cantidadAprobada || this.cantidad);
});

// Middleware para actualizar fechaModificacion
detalleSolicitudSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.fechaModificacion = getChileDateTime();
    }
    
    // Auto-calcular fecha de vencimiento de garantía
    if (this.garantia?.meses && this.fechaEntrega && !this.garantia.fechaVencimiento) {
        const fechaVencimiento = new Date(this.fechaEntrega);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + this.garantia.meses);
        this.garantia.fechaVencimiento = fechaVencimiento;
    }
    
    next();
});

// Middleware para validar cantidades
detalleSolicitudSchema.pre('save', function(next) {
    // La cantidad entregada no puede ser mayor a la aprobada
    if (this.cantidadEntregada && this.cantidadAprobada && 
        this.cantidadEntregada > this.cantidadAprobada) {
        return next(new Error('La cantidad entregada no puede ser mayor a la cantidad aprobada'));
    }
    
    // La cantidad aprobada no puede ser mayor a la solicitada
    if (this.cantidadAprobada && this.cantidadAprobada > this.cantidad) {
        return next(new Error('La cantidad aprobada no puede ser mayor a la cantidad solicitada'));
    }
    
    next();
});

// Método para aprobar detalle
detalleSolicitudSchema.methods.aprobar = function(cantidadAprobada?: number) {
    this.estado = 'aprobado';
    if (cantidadAprobada !== undefined) {
        this.cantidadAprobada = Math.min(cantidadAprobada, this.cantidad);
    } else {
        this.cantidadAprobada = this.cantidad;
    }
    return this.save();
};

// Método para entregar detalle
detalleSolicitudSchema.methods.entregar = function(cantidadEntregada: number, fechaEntrega?: Date) {
    const maxCantidad = this.cantidadAprobada || this.cantidad;
    this.cantidadEntregada = (this.cantidadEntregada || 0) + cantidadEntregada;
    
    if (this.cantidadEntregada >= maxCantidad) {
        this.estado = 'entregado';
    } else {
        this.estado = 'parcial';
    }
    
    if (fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }
    
    return this.save();
};

const DetalleSolicitud = mongoose.model<IDetalleSolicitud>("DetalleSolicitud", detalleSolicitudSchema);
export default DetalleSolicitud;
