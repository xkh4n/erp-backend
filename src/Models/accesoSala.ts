import mongoose from "mongoose";
import { IAccesoSala } from "../Interfaces";
import { getChileDateTime } from "../Library/Utils/ManageDate";

const AccesoSalaSchema = new mongoose.Schema<IAccesoSala>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    salaId: { type: mongoose.Schema.Types.ObjectId, ref: "Sala", required: true },
    fechaAcceso: { type: Date, default: getChileDateTime },
    state: { type: String, enum: ["aprobado", "rechazado", "pendiente"], default: "pendiente" },
    centrocostoId: { type: mongoose.Schema.Types.ObjectId, ref: "CentroCosto", required: true },
    beneficiario: { type: String, required: true },
    motivo: { type: String, required: true },
    autorizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
}, { timestamps: true });

const AccesoSala = mongoose.model<IAccesoSala>("AccesoSala", AccesoSalaSchema);

export default AccesoSala;
