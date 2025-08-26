import mongoose from "mongoose";
import { IUser } from "../Interfaces";
import { getChileDateTime } from "../Library/Utils/ManageDate";

const userSchema = new mongoose.Schema<IUser>({
    username: {type: String,required: true},
    password: {type: String,required: true},
    role: {type: mongoose.Schema.Types.ObjectId, ref: "Roles", required: true},
    personId: {type: mongoose.Schema.Types.ObjectId, ref: "Persons", required: true},
    isActive: {type: Boolean,default: false},
    // Campos de seguridad
    loginAttempts: {type: Number, default: 0},
    lockedUntil: {type: Date},
    lastLogin: {type: Date},
    lastLoginIP: {type: String},
    passwordChangedAt: {type: Date, default: getChileDateTime},
    // Timestamps
    createdAt: {type: Date,default: getChileDateTime},
    updatedAt: {type: Date,default: getChileDateTime}
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false
});

// Virtual para verificar si la cuenta está bloqueada
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
});

// Método para incrementar intentos de login
userSchema.methods.incLoginAttempts = function() {
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 horas

    // Si ya está bloqueado y el tiempo expiró, resetear
    if (this.lockedUntil && this.lockedUntil < new Date()) {
        return this.updateOne({
            $unset: { lockedUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates: any = { $inc: { loginAttempts: 1 } };

    // Si alcanzó el máximo de intentos y no está bloqueado, bloquear
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = {
            lockedUntil: new Date(Date.now() + lockTime)
        };
    }

    return this.updateOne(updates);
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { lockedUntil: 1, loginAttempts: 1 }
    });
};

// Índices
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'role': 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model<IUser>('User', userSchema);
export default User;