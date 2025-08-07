import mongoose from 'mongoose';

// Enum para tipos de vigencia
export enum ValidityType {
  MONTHS = 'meses',
  YEARS = 'años',
  DAYS = 'dias'
}

// Interface para el documento de inventario
export interface IInventory {
    inventoryCode: string;
    producto:mongoose.Schema.Types.ObjectId; 
    modelo: string;
    serialNumber: string;
    status: mongoose.Schema.Types.ObjectId;
    gerencia?: mongoose.Schema.Types.ObjectId;
    // Campos de recepción
    nroSolicitud?: string;
    proveedor?: mongoose.Schema.Types.ObjectId;
    tipoDocumento?: string;
    numeroDocumento?: string;
    assignedUser?: mongoose.Schema.Types.ObjectId;
    validityValue?: number;
    validityType?: ValidityType;
    expirationDate?: Date;
    value?: number;
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: mongoose.Schema.Types.ObjectId;
    updatedBy?: mongoose.Schema.Types.ObjectId;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Schema.Types.ObjectId;
}