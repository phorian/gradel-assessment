import express, {Request, Response} from 'express';
import * as dotenv from "dotenv";
import bodyParser from 'body-parser';
import userProfileRouter from './routes/authRouter'
import connectDB from './config/database';

const port = process.env.PORT || 36371



export const app = express()

connectDB();

dotenv.config();

app.use(express.json())
app.use(bodyParser.json())


app.use('/api/users', userProfileRouter );

//404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
  });

app.listen(port, () => console.log('Server is up'));