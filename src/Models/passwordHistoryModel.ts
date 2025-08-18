import mongoose from "mongoose";
import { getChileDateTime } from "../Library/Utils/ManageDate";
import { IPasswordHistory } from "../Interfaces";

const passwordHistorySchema = new mongoose.Schema<IPasswordHistory>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: getChileDateTime,
        index: true
    }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion',
        updatedAt: false
    },
    versionKey: false
});

// Índice compuesto para optimizar consultas
passwordHistorySchema.index({ userId: 1, createdAt: -1 });

// TTL index para limpiar automáticamente después de cierto tiempo (opcional)
passwordHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 año

const PasswordHistory = mongoose.model<IPasswordHistory>("PasswordHistory", passwordHistorySchema);
export default PasswordHistory;
