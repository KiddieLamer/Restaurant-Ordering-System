import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import tableRoutes from './routes/tableRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Restaurant Ordering System API' });
});

app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-table', (tableId: string) => {
    socket.join(`table-${tableId}`);
    console.log(`Client ${socket.id} joined table ${tableId}`);
  });
  
  socket.on('join-kitchen', () => {
    socket.join('kitchen');
    console.log(`Client ${socket.id} joined kitchen`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export { app, httpServer, io };