import { Document, Types } from "mongoose";

export interface ISolicitud extends Document {
    _id: string;
    nroSolicitud: string;
    solicitante: string;
    cargoSolicitante: string;
    beneficiario: string;
    gerencia: Types.ObjectId; // ObjectId reference
    emailSolicitante: string;
    telefonoSolicitante: string;
    telefonoBeneficiario: string;
    cuentaBeneficiario: string;
    observaciones?: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso' | 'completado';
    fechaCreacion: Date;
    fechaModificacion: Date;
    fechaAprobacion?: Date;
    fechaRechazo?: Date;
    fechaEntrega?: Date;
    fechaVencimiento?: Date;
    usuarioCreador?: string; // User ID of the creator
    usuarioAprobador?: string;
    usuarioRechazador?: string;
    motivoRechazo?: string;
    usuarioModificador?: string; // User ID of the last modifier
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
    fechaRequerida?: Date;
    centroCosto?: string;
}

export interface ISolicitudPopulated extends Omit<ISolicitud, 'gerencia'> {
    gerencia: {
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
    centroCosto?: string;
}