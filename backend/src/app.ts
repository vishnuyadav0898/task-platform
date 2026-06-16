import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { sequelize } from './models';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import taskRoutes from './routes/taskRoutes';
import activityRoutes from './routes/activityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { setupSwagger } from './swagger';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Setup Swagger UI
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
