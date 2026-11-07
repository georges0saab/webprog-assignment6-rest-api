
export function validateBook(req, res, next) {
  const { title, author, pages, finished, tags } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (title.trim().length > 120) {
    return res.status(400).json({ error: 'title must be 120 characters or fewer' });
  }
  if (typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'author is required' });
  }
  if (pages !== undefined && (!Number.isInteger(pages) || pages < 1)) {
    return res.status(400).json({ error: 'pages must be a whole number of 1 or more' });
  }
  if (finished !== undefined && typeof finished !== 'boolean') {
    return res.status(400).json({ error: 'finished must be true or false' });
  }
  if (tags !== undefined && (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string'))) {
    return res.status(400).json({ error: 'tags must be an array of strings' });
  }

  next();
}