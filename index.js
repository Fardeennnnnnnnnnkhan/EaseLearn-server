import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './database/db.js';
import userRoute from './routes/user.js';
import courseRoute from './routes/course.js';
import adminRoute from './routes/admin.js'
import cors from 'cors'
import path from 'path'

dotenv.config();
const app = express();
app.use(express.json())
app.use(cors())

app.get('/' , (req, res) => {

  res.send('Fardeen Khan');
});

app.use('/uploads' , express.static("uploads"))

app.use('/api', userRoute);
app.use('/course', courseRoute);
app.use('/admin', adminRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
  connectDb();
});