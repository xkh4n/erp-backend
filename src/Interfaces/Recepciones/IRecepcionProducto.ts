import { Document, Types } from 'mongoose';

export interface IRecepcionProducto extends Document {
    solicitudId: Types.ObjectId;
    detalleSolicitudId: Types.ObjectId;
    nroSolicitud: string;
    producto: Types.ObjectId;
    numeroSerie: string;
    codigoInventario: string;
    fechaRecepcion: Date;
    fechaCreacion: Date;
    fechaModificacion: Date;
    usuarioRecepcion?: string;
}

export interface IRecepcionProductoPopulated extends Omit<IRecepcionProducto, 'solicitudId' | 'detalleSolicitudId' | 'producto'> {
    solicitudId: {
        _id: string;
        nroSolicitud: string;
        solicitante: string;
        beneficiario: string;
    };
    detalleSolicitudId: {
        _id: string;
        cantidad: number;
        cantidadAprobada: number;
    };
    producto: {
        _id: string;
        nombre: string;
        modelo: string;
        descripcion: string;
    };
}
