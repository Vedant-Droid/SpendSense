import express from 'express'
import cors from 'cors';
import connectToMongoServer from './db/index.js';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import verifyToken from './middleware/verifyJWT.js';
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const app = express()
app.set('trust proxy', 1);
app.use(express.json())
app.use(cookieParser());
dotenv.config();

const PORT = process.env.port || 5000;

const allowedOrigin = process.env.FRONTEND_URL || `http://localhost:${process.env.frontEndPort || 5173}`;

app.use(cors({ 
  origin: allowedOrigin, 
  credentials: true 
}));

const startServer = async () => {
  try {
    await connectToMongoServer();
    app.listen(PORT, () => {

      console.log(`Server is running on port ${PORT}`);
      console.log(`Allowing requests from: ${allowedOrigin}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Routes
app.use('/auth', authRoutes);
app.use('/user', verifyToken, userRoutes);

startServer();
