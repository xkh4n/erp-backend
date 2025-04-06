import mongoose from "mongoose";
import { IUser } from "../Interfaces";
import { Schema } from "mongoose";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'guest',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });


const User = mongoose.model<IUser>('User', userSchema);
export default User;