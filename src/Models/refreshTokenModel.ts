import mongoose from "mongoose";
import { getChileDateTime } from "../Library/Utils/ManageDate";
import { IRefreshToken } from "../Interfaces";

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    tokenHash: { 
        type: String, 
        required: true,
        unique: true
    },
    tokenFamily: {
        type: String,
        required: true,
        index: true
    },
    expiresAt: { 
        type: Date, 
        required: true,
        index: true
    },
    isRevoked: { 
        type: Boolean, 
        default: false,
        index: true
    },
    revokedAt: { 
        type: Date 
    },
    userAgent: { 
        type: String 
    },
    ipAddress: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: getChileDateTime,
        index: true
    }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion',
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false
});

// Índices compuestos
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ tokenFamily: 1, isRevoked: 1 });


const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
export default RefreshToken;
