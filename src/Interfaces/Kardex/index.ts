import { Types } from 'mongoose';
export enum MovementType {
    ENTRY = 'entrada',
    EXIT = 'salida',
    ADJUSTMENT = 'ajuste'
}

export interface IKardex {
    product: Types.ObjectId
    movementType: MovementType;
    quantity: number;
    date: Date;
    cost: number;
    usuario?: string;
    balance: number;
    referencia?: string; // Puede ser un número de orden, factura, etc.
    observaciones?: string; // Campo opcional para notas adicionales
}
