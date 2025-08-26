import mongoose from "mongoose";
export default interface IAsignacion {
  userId: mongoose.Schema.Types.ObjectId;
  serie: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaVencimiento: Date;
  estado: mongoose.Schema.Types.ObjectId;
  ccosto: mongoose.Schema.Types.ObjectId;
  inventoryid: mongoose.Schema.Types.ObjectId;
}
