import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongoUrl = process.env.mongo_uri;
const connectToMongoServer=async()=>{
// console.log("Connecting to MongoDB...", mongoUrl);
    try {
        const connectionInstace=await mongoose.connect(`${mongoUrl}`);
        console.log(`MongoDB Connected!! DB Host: ${connectionInstace.connection.host}`);
        
    } catch (error) {
        console.error("Mongo Server Failed :",error)
        process.exit(1)
    }
}
export default connectToMongoServer