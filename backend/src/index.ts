import app from './app';
import { sequelize } from './models';
import dotenv from 'dotenv';
import { initScheduler } from './workers/scheduler';
dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // In production, use migrations instead of sync({ alter: true })
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // Initialize BullMQ scheduler
    await initScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
