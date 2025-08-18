import mongoose from "mongoose";

export default interface IRefreshToken {
    _id?: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    tokenHash: string;
    tokenFamily: string;
    expiresAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
}
