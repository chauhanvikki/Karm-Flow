import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import applicationsRoutes from './routes/applications';

// Node.js Windows SRV lookup fix removed to rely on system DNS

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://karmflow.vercel.app',
  'https://karm-flow-nine.vercel.app',
  process.env.CORS_ALLOWED_ORIGIN,
].filter(Boolean) as string[];

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;

  const normalizedOrigin = origin.toLowerCase();
  return allowedOrigins.some((entry) => {
    if (!entry) return false;
    const normalizedEntry = entry.toLowerCase();
    if (normalizedEntry === '*' || normalizedEntry === normalizedOrigin) {
      return true;
    }

    if (normalizedEntry.includes('*')) {
      const escaped = normalizedEntry.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      const pattern = new RegExp(`^${escaped}$`);
      return pattern.test(normalizedOrigin);
    }

    return false;
  }) || /\.vercel\.app$/i.test(normalizedOrigin) || /\.onrender\.com$/i.test(normalizedOrigin);
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Socket.io setup
let io: Server;
export const getIo = () => io;

io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((entry) => entry === origin || entry === '*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin not allowed: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PATCH']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-job-room', (jobId) => {
    socket.join(`job_${jobId}`);
    console.log(`Socket ${socket.id} joined room job_${jobId}`);
  });

  socket.on('leave-job-room', (jobId) => {
    socket.leave(`job_${jobId}`);
    console.log(`Socket ${socket.id} left room job_${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/jobs', jobsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/applications', applicationsRoutes);
app.use('/api/applications', applicationsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KarmFlow API is running' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KarmFlow API is running' });
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI is not defined in the .env file!');
  process.exit(1);
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB!');
    
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
