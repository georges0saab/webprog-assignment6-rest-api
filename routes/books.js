import express from 'express';
import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { validateBook } from '../middleware/validateBook.js';

const router = express.Router();

// Turns an error into a response: data the schema rejects is a 400, anything else is a 500
function sendError(res, err) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server' });
}

// GET /api/books           -> all books, newest first
// GET /api/books?search=x  -> only the books whose title contains x
router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { title: { $regex: search, $options: 'i' } };
    res.json(await Book.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/books/:id -> one book
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    sendError(res, err);
  }
});

// POST /api/books -> create a book
router.post('/', validateBook, async (req, res) => {
  try {
    res.status(201).json(await Book.create(req.body));
  } catch (err) {
    sendError(res, err);
  }
});

// PUT /api/books/:id -> update a book and return the new version
router.put('/:id', validateBook, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const book = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    sendError(res, err);
  }
});

// DELETE /api/books/:id -> remove a book, 204 means done and there is no body
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.sendStatus(204);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;