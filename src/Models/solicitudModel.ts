import { getChileDateTime } from '../Library/Utils/ManageDate';
import mongoose from "mongoose";
import { ISolicitud } from "../Interfaces/Solicitudes";

const solicitudSchema = new mongoose.Schema<ISolicitud>({
    nroSolicitud: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    solicitante: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    cargoSolicitante: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    beneficiario: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    centroCosto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CentroCostos',
        required: true,
        index: true
    },
    emailSolicitante: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email: string) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Email no válido'
        }
    },
    telefonoSolicitante: {
        type: String,
        required: true,
        trim: true
    },
    telefonoBeneficiario: {
        type: String,
        required: true,
        trim: true
    },
    cuentaBeneficiario: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    observaciones: {
        type: String,
        maxlength: 500,
        trim: true,
        uppercase: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobado', 'rechazado', 'en_proceso', 'completado'],
        default: 'pendiente',
        index: true
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
    fechaAprobacion: {
        type: Date
    },
    usuarioAprobador: {
        type: String,
        trim: true
    },
    motivoRechazo: {
        type: String,
        trim: true
    },
    prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta', 'urgente'],
        default: 'media',
        index: true
    },
    fechaRequerida: {
        type: Date,
        index: true
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
solicitudSchema.index({ nroSolicitud: 1, estado: 1 });
solicitudSchema.index({ centroCosto: 1, estado: 1 });
solicitudSchema.index({ fechaCreacion: -1, estado: 1 });
solicitudSchema.index({ solicitante: 1, fechaCreacion: -1 });

// Virtual para obtener el total de elementos
solicitudSchema.virtual('totalElementos', {
    ref: 'DetalleSolicitud',
    localField: 'nroSolicitud',
    foreignField: 'nroSolicitud',
    count: true
});

// Middleware para actualizar fechaModificacion
solicitudSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.fechaModificacion = getChileDateTime();
    }
    next();
});

// Método para aprobar solicitud
solicitudSchema.methods.aprobar = function(usuarioAprobador: string) {
    this.estado = 'aprobado';
    this.fechaAprobacion = getChileDateTime();
    this.usuarioAprobador = usuarioAprobador;
    return this.save();
};

// Método para rechazar solicitud
solicitudSchema.methods.rechazar = function(motivo: string, usuarioAprobador: string) {
    this.estado = 'rechazado';
    this.motivoRechazo = motivo;
    this.usuarioAprobador = usuarioAprobador;
    return this.save();
};

const Solicitud = mongoose.model<ISolicitud>("Solicitud", solicitudSchema);
export default Solicitud;
