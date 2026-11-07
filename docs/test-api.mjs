// Runs every route once and checks the status code it returns.
// Usage (server must be running):  node docs/test-api.mjs
// Another address:                  node docs/test-api.mjs http://localhost:4000
const BASE = process.argv[2] ?? 'http://localhost:3000';
let failed = 0;

async function check(label, method, path, expected, body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(BASE + path, options);
  const text = await res.text();
  const ok = res.status === expected;
  if (!ok) failed++;

  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  console.log(`      ${method} ${path} -> ${res.status} (expected ${expected})`);
  if (text) console.log(`      ${text.slice(0, 100)}`);

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const MISSING_ID = '000000000000000000000000';

try {
  await check('List all books', 'GET', '/api/books', 200);

  const created = await check('Create a book', 'POST', '/api/books', 201, {
    title: 'Dune',
    author: 'Herbert',
    pages: 400,
    tags: ['sci-fi'],
  });
  const id = created?._id;

  await check('Get one book', 'GET', `/api/books/${id}`, 200);
  await check('Search by title', 'GET', '/api/books?search=dun', 200);
  await check('Update the book', 'PUT', `/api/books/${id}`, 200, {
    title: 'Dune Messiah',
    author: 'Herbert',
    finished: true,
  });

  await check('Create without a title', 'POST', '/api/books', 400, { author: 'x' });
  await check('Create with pages 0', 'POST', '/api/books', 400, { title: 't', author: 'a', pages: 0 });
  await check('Create with malformed JSON', 'POST', '/api/books', 400, '{"title": ');
  await check('Update with an empty title', 'PUT', `/api/books/${id}`, 400, { title: '', author: 'a' });
  await check('Get with an invalid id', 'GET', '/api/books/abc', 400);
  await check('Get a book that does not exist', 'GET', `/api/books/${MISSING_ID}`, 404);
  await check('Update a book that does not exist', 'PUT', `/api/books/${MISSING_ID}`, 404, { title: 't', author: 'a' });

  await check('Delete the book', 'DELETE', `/api/books/${id}`, 204);
  await check('Delete it again', 'DELETE', `/api/books/${id}`, 404);
  await check('Unknown route', 'GET', '/nope', 404);
} catch (err) {
  console.error(`Could not reach ${BASE}: ${err.message}`);
  console.error('Is the server running? Start it with: npm run dev');
  process.exit(1);
}

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);