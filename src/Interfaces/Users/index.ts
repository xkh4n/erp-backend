import mongoose from "mongoose";
type ObjectId = mongoose.Types.ObjectId;
export default interface IUser {
    username: string;
    password: string;
    role: ObjectId; // ✅ Cambiado
    isActive: boolean;
    personId?: string | ObjectId; // ✅ Hecho opcional

    // Campos de seguridad
    loginAttempts?: number;
    lockedUntil?: Date;
    lastLogin?: Date;
    lastLoginIP?: string;
    passwordChangedAt?: Date;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;

    // Métodos virtuales
    isLocked?: boolean;

    // Métodos de instancia
    incLoginAttempts?: () => Promise<any>;
    resetLoginAttempts?: () => Promise<any>;
}