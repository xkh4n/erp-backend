import mongoose from "mongoose";
export default interface IAccesoSala {
  userId: mongoose.Schema.Types.ObjectId;
  salaId: mongoose.Schema.Types.ObjectId;
  centrocostoId: mongoose.Schema.Types.ObjectId;
  beneficiario: String;
  fechaAcceso: Date;
  motivo: string;
  autorizadoPor?: mongoose.Schema.Types.ObjectId;
  state: "aprobado" | "rechazado" | "pendiente";
  estado: "activo" | "inactivo";
}