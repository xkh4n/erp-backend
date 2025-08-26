import mongoose from "mongoose";
import { getChileDateTime } from "../Library/Utils/ManageDate";
import { IPermissions } from "../Interfaces";

const permissionSchema = new mongoose.Schema<IPermissions>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    resource: { type: String, required: true }, // ej: "gerencias", "users"
    action: { type: String, required: true }, // ej: "create", "read", "update", "delete"
    isActive: { type: Boolean, default: true }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false
});

const Permissions = mongoose.model<IPermissions>("Permissions", permissionSchema);
export default Permissions;

