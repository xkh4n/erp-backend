import mongoose from "mongoose";
import { getChileDateTime } from "../Library/Utils/ManageDate";
import { IRoles } from "../Interfaces";

const rolesSchema = new mongoose.Schema<IRoles>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permissions" }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false
});

const Roles = mongoose.model<IRoles>("Roles", rolesSchema);
export default Roles;
