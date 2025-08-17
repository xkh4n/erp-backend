import mongoose from "mongoose";
import { IUser } from "../Interfaces";
import { getChileDateTime } from "../Library/Utils/ManageDate";

const userSchema = new mongoose.Schema<IUser>({
    username: {type: String,required: true},
    password: {type: String,required: true},
    role: {type: mongoose.Schema.Types.ObjectId, ref: "Roles", required: true},
    personId: {type: mongoose.Schema.Types.ObjectId, ref: "Persons", required: true},
    isActive: {type: Boolean,default: false},
    createdAt: {type: Date,default: getChileDateTime},
    updatedAt: {type: Date,default: getChileDateTime}
}, {
    timestamps: { 
        createdAt: 'fechaCreacion', 
        updatedAt: 'fechaModificacion',
        currentTime: getChileDateTime
    },
    versionKey: false
});


const User = mongoose.model<IUser>('User', userSchema);
export default User;