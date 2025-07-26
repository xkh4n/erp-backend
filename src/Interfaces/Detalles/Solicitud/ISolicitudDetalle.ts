import { Document, Types } from "mongoose";

export interface IDetalleSolicitud extends Document {
    _id: string;
    nroSolicitud: string; // Reference a la solicitud principal
    solicitudId: Types.ObjectId; // ObjectId reference
    tipoEquipamiento: Types.ObjectId; // ObjectId reference a categoria
    producto: Types.ObjectId; // ObjectId reference a producto
    cantidad: number;
    cantidadAprobada?: number;
    cantidadEntregada?: number;
    precioEstimado?: number;
    precioReal?: number;
    proveedor?: Types.ObjectId; // ObjectId reference
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'parcial' | 'entregado';
    fechaEntrega?: Date;
    observacionesDetalle?: string;
    fechaCreacion: Date;
    fechaModificacion: Date;
    numeroSerie?: string;
    codigoInventario?: string;
    garantia?: {
        meses: number;
        fechaVencimiento: Date;
        proveedor: string;
    };
}

export interface IDetalleSolicitudPopulated extends Omit<IDetalleSolicitud, 'tipoEquipamiento' | 'producto' | 'solicitudId' | 'proveedor'> {
    solicitudId: {
        _id: string;
        nroSolicitud: string;
        solicitante: string;
        estado: string;
    };
    tipoEquipamiento: {
        _id: string;
        codigo: string;
        nombre: string;
        descripcion: string;
        tipo: string;
    };
    producto: {
        _id: string;
        nombre: string;
        modelo: string;
        descripcion: string;
        categoria: string;
    };
    proveedor?: {
        _id: string;
        nombre: string;
        rut: string;
        contacto: string;
    };
}
