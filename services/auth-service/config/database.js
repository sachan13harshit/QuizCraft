import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log(mongoURI);
    
    mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected Successfully"))
    .catch((error) => console.log("Failed to connect", error));
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};



export default connectDB; 