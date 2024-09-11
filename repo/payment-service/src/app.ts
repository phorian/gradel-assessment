import express, { Request, Response} from 'express';
import connectDB from './config/database';
import paymentRouter from './routes/paymentRoutes';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/payment', paymentRouter);

//404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;