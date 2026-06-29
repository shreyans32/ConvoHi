import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import socketHandler from './socket/socketHandler.js';
dotenv.config();

//dotenv.config({path: "./backend/.env"});

console.log("MONGODB_URI=", process.env.MONGODB_URI);
// Connect DB
connectDB();
const app = express();
// Secure headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows assets/uploads to be loaded correctly by frontend
}));
// CORS setup - allows dynamic ports (like 5173/5174) in local development
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));
// Parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Rate limiters for security
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per windowMs
  message: { message: 'Too many auth attempts, please try again after 15 minutes' }
});
// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/chats', apiLimiter, chatRoutes);
app.use('/api/groups', apiLimiter, groupRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
} else {
  // Base route for health check in development
  app.get('/', (req, res) => {
    res.json({ message: 'API is running successfully...' });
  });
}
// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);
// HTTP and Socket.IO servers configuration
const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
// Pass IO to handlers
socketHandler(io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
export { app, io };