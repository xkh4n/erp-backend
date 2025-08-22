import mongoose from "mongoose";
import { IAsignacion } from "../Interfaces";
import { getChileDateTime } from "../Library/Utils/ManageDate";

const asignacionSchema = new mongoose.Schema<IAsignacion>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuarios", required: true },
  serie: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaModificacion: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date, required: true },
  estado: { type: mongoose.Schema.Types.ObjectId, ref: "SubEstadosActivos", required: true },
  ccosto: { type: mongoose.Schema.Types.ObjectId, ref: "CentroCostos", required: true },
  inventoryid: { type: mongoose.Schema.Types.ObjectId, ref: "Inventario", required: true },
},{
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false // Desactivar el campo __v
});

// Middleware para agregar campos de auditoría
asignacionSchema.pre("save", function (next) {
    const currentDate = getChileDateTime();
    if (!this.fechaCreacion) {
        this.fechaCreacion = currentDate;
    }
    this.fechaModificacion = currentDate;
    next();
});

// Middleware para eliminar campos de auditoría en las respuestas
asignacionSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.fechaCreacion;
        delete ret.fechaModificacion;
        return ret;
    }
});

// Middleware para actualizar fechaModificacion en las actualizaciones
asignacionSchema.pre("findOneAndUpdate", function (next) {
    this.set({ fechaModificacion: getChileDateTime() });
    next();
});

// Indexes
asignacionSchema.index({ serie: 1 }, { unique: true });

const Asignaciones = mongoose.model<IAsignacion>("Asignaciones", asignacionSchema);

export default Asignaciones;
