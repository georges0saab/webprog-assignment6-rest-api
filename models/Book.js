import mongoose from 'mongoose';

// The schema sets the rules for what a book looks like
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    author: { type: String, required: true, trim: true },
    pages: { type: Number, min: 1 },
    finished: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// The model does the work: Book maps to the "books" collection
export const Book = mongoose.model('Book', bookSchema);