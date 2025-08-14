import mongoose from "mongoose";
import { IAsignacion } from "../Interfaces";

const asignacionSchema = new mongoose.Schema<IAsignacion>({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date, required: true },
  estado: { type: mongoose.Schema.Types.ObjectId, ref: "SubEstadosActivos", required: true },
  usuarioId: { type: String, required: true },
  inventoryid: { type: mongoose.Schema.Types.ObjectId, ref: "Inventario", required: true },
});

const AsignacionModel = mongoose.model<IAsignacion>("Asignacion", asignacionSchema);

export default AsignacionModel;
