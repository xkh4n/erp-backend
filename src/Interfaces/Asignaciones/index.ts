import mongoose from "mongoose";
export default interface IAsignacion {
  nombre: string;
  descripcion: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  estado: mongoose.Schema.Types.ObjectId;
  usuarioId: string;
  inventoryid: mongoose.Schema.Types.ObjectId;
}
