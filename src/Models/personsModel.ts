import mongoose from "mongoose";
import { getChileDateTime } from "../Library/Utils/ManageDate";
import { IPersons } from "../Interfaces";

const personsSchema = new mongoose.Schema<IPersons>({
    dni: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: false },
    birthdate: { type: Date, required: false },
    email01: { type: String, required: true },
    email02: { type: String, required: false },
    phone01: { type: String, required: false },
    phone02: { type: String, required: false },
    address: { type: String, required: false },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "Comuna", required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Paises", required: true },
    postalCode: { type: String, required: false },
    fechaCreacion: { 
        type: Date, 
        default: getChileDateTime,
        index: true
    },
    fechaModificacion: { 
        type: Date, 
        default: getChileDateTime,
        index: true
    }
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false
});

const Persons = mongoose.model<IPersons>("Persons", personsSchema);

export default Persons;
