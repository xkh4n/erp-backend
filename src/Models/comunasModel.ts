import mongoose from "mongoose";
import IComuna from "../Interfaces/Comunas"
const comunaSchema = new mongoose.Schema({
    cod_territorial:{
        type: String,
        maxlenght: 5,
        required: true,
        unique: true
    },
    cod_postal:{
        type: Number,
        maxlenght: 10,
        required: true
    },
    cod_sii:{
        type: Number,
        maxlenght: 10,
        required: true,
        unique: true
    },
    name_comuna:{
        type: String,
        required: true,
        unique: true
    },
    ciudad:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ciudad'
    }

})

const Comuna = mongoose.model<IComuna>('Comuna', comunaSchema);

export default Comuna;