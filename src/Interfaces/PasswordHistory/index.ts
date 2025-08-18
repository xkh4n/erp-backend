import mongoose from "mongoose";

export default interface IPasswordHistory {
    _id?: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    passwordHash: string;
    createdAt: Date;
}
