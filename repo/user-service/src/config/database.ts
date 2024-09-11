import mongoose from "mongoose";


const connectDB = async (): Promise<void> => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:36371/user-service');
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.error(`Error:`, err)
      process.exit(1);
    }
  };
  
  export default connectDB;