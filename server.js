import 'dotenv/config'; // first line, before anything reads process.env
import express from 'express';
import mongoose from 'mongoose';

const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000; // every env value arrives as a string

const app = express();
app.use(express.json()); // fills req.body, must come before the routes

// routes go here

// Connect first, then listen
try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}