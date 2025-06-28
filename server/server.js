import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import userRoutes from './routes/users.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shareable-todo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', authenticateToken, todoRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Socket.io for real-time updates
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token) {
    // In production, verify JWT token here
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('todo-created', (data) => {
    // Broadcast to assigned user
    if (data.assignedTo) {
      io.to(`user-${data.assignedTo}`).emit('new-todo', data);
    }
    // Broadcast to creator
    io.to(`user-${data.createdBy}`).emit('new-todo', data);
  });

  socket.on('todo-updated', (data) => {
    // Broadcast to all involved users
    if (data.assignedTo) {
      io.to(`user-${data.assignedTo}`).emit('todo-updated', data);
    }
    io.to(`user-${data.createdBy}`).emit('todo-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});