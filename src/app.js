// app.js
import express, { json } from 'express';
import connectDB from '../config.js';
import userRouter from './routes/user.js';

import cors from 'cors';

const app = express();
app.use(json());
app.use(cors({origin:'*',methods:['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'],
}))
connectDB();

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/user", userRouter)


