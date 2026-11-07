import 'dotenv/config'; // first line, before anything reads process.env
import express from 'express';
import mongoose from 'mongoose';
import booksRouter from './routes/books.js';

const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000; // every env value arrives as a string

const app = express();
app.use(express.json()); // fills req.body, must come before the routes

app.use('/api/books', booksRouter);

// After all routes: nothing matched
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Catches errors thrown before a route runs, like a body that is not valid JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Connect first, then listen
try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}