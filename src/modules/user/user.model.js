import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String },
    phone: {
        type: String,
        // required: [true, "Phone number is required"],
        trim: true, // Removes leading/trailing whitespace
        minLength: [10, "Phone number must be at least 10 characters long"],
        maxLength: [10, "Phone number cannot exceed 10 characters"],
        match: [/^\+?\d+[\d\s]+$/, "Please fill a valid telephone number"], // Simple regex for global numbers
    },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    avatar: { type: String, },
    role: {
        type: String,
        enum: ["admin", "sales_agent"],
        default: "admin"
    },
}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
