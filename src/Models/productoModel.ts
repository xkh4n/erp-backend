import mongoose from "mongoose";
import { IProducto } from "../Interfaces";

const productoSchema = new mongoose.Schema<IProducto>({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    modelo: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categoria",
        required: true,
    },
});

const Producto = mongoose.model<IProducto>("Producto", productoSchema);

export default Producto;