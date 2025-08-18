import mongoose from "mongoose";
export default interface IUser {
    username: string;
    password: string;
    role: mongoose.Schema.Types.ObjectId;
    isActive: boolean;
    personId?: mongoose.Schema.Types.ObjectId;
    // Campos de seguridad
    loginAttempts?: number;
    lockedUntil?: Date;
    lastLogin?: Date;
    lastLoginIP?: string;
    passwordChangedAt?: Date;
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    // Métodos virtuales
    isLocked?: boolean;
    // Métodos de instancia
    incLoginAttempts?: () => Promise<any>;
    resetLoginAttempts?: () => Promise<any>;
}