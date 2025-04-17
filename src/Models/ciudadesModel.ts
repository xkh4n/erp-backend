import mongoose from "mongoose";
import ICiudad from "../Interfaces/Ciudad";
const ciudadSchema = new mongoose.Schema({
    iata_codes:{
        type: String,
        maxlength: 3,  
        required: true,
        unique: true,
        uppercase: true, 
        trim: true
    },
    name_city:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    country:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pais',
        required: true
    }
})

const Ciudad = mongoose.model<ICiudad>('Ciudad', ciudadSchema);

export default Ciudad;