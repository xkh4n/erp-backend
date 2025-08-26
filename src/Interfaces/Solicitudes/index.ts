import { Document, Types } from "mongoose";

export interface ISolicitud extends Document {
    _id: string;
    nroSolicitud: string;
    solicitante: string;
    cargoSolicitante: string;
    beneficiario: string;
    centroCosto: Types.ObjectId; // ObjectId reference al centro de costo
    emailSolicitante: string;
    telefonoSolicitante: string;
    telefonoBeneficiario: string;
    cuentaBeneficiario: string;
    observaciones?: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso' | 'completado';
    fechaCreacion: Date;
    fechaModificacion: Date;
    fechaAprobacion?: Date;
    usuarioAprobador?: string;
    motivoRechazo?: string;
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
    fechaRequerida?: Date;
}

export interface ISolicitudPopulated extends Omit<ISolicitud, 'centroCosto'> {
    centroCosto: {
        _id: string;
        codigo: string;
        nombre: string;
        descripcion: string;
    };
}
export interface ISolicitudFilter {
    nroSolicitud?: string;
    solicitante?: string;
    estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso' | 'completado';
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    fechaAprobacion?: Date;
    usuarioAprobador?: string;
    prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
    fechaRequerida?: Date;
    centroCosto?: Types.ObjectId;
}