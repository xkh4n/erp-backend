import mongoose from "mongoose";
export default interface IUser {
    username: string;
    password: string;
    role: mongoose.Schema.Types.ObjectId;
    isActive: boolean;
    personId?: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}