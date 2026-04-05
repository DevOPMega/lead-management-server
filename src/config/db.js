import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected ✅")
    } catch (error) {
        console.log(`Can't connect to Database ==>${error.message}`);
        return;
    }
};


export default connectDb;