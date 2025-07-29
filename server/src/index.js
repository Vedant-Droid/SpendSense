import express from 'express'
import cors from 'cors';
import connectToMongoServer from './db/index.js';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import verifyToken from './middleware/verifyJWT.js';
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const app = express()
app.use(express.json())
app.use(cookieParser());
dotenv.config();

const port=process.env.port || 5003
app.use(cors({ origin: `http://localhost:${process.env.frontEndPort}`, credentials: true }));

const startServer=async()=>{
  try {
    await connectToMongoServer();
    app.listen(port,()=>{
      console.log(`Server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
 

app.use('/auth',authRoutes)
app.use('/user',verifyToken,userRoutes)

startServer();




