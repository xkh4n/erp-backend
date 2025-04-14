import mongoose from "mongoose";
import { IPaises } from "../Interfaces";
import { Schema } from "mongoose";
const paisesSchema = new Schema<IPaises>({
    iso_code:{
        type: String,
        maxlenght: 2,
        required: true,
        unique: true
    },
    iata_code:{
        type: String,
        maxlenght: 3,
        required: true,
        unique: true
    },
    name_country:{
        type: String,
        required: true
    }
})

const Paises = mongoose.model<IPaises>('Pais', paisesSchema);
export default Paises;