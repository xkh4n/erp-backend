import mongoose from "mongoose";

export default interface IPersons {
    dni: string;
    name: string;
    age?: number;
    birthdate?: Date;
    email01: string;
    email02?: string;
    phone01?: string;
    phone02?: string;
    address?: string;
    state?: mongoose.Types.ObjectId;
    country?: mongoose.Types.ObjectId;
    postalCode?: string;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
}