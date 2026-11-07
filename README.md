# Books REST API

A RESTful API for a reading list, built with Node.js, Express and MongoDB (Mongoose), for Web Programming, Assignment 6.

The primary resource is a **book**, with full CRUD: list all, get one, create, update and delete. Data is stored in MongoDB Atlas, so it survives a server restart.

## Setup

You need [Node.js](https://nodejs.org) (version 20 or later) and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
git clone https://github.com/georges0saab/webprog-assignment6-rest-api.git
cd webprog-assignment6-rest-api
npm install
```

Create a `.env` file in the project folder (it is listed in `.gitignore`, so it is never committed). Copy `.env.example` and fill in your own values:

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/books
PORT=3000
```

| Variable | What it is |
|---|---|
| `MONGODB_URI` | The connection string from Atlas (Connect → Drivers). Put your database user's password in it, and the database name (`books`) after the last `/`. |
| `PORT` | The port the API listens on. Optional, defaults to 3000. |

In Atlas, the database user needs the **Read and write to any database** role, and **Network Access** must allow your IP address.

Start the server:

```bash
npm run dev
```

The terminal should print `connected to MongoDB` and `API listening on http://localhost:3000`.

**If you see `querySrv ECONNREFUSED`:** your network's DNS does not support the `mongodb+srv://` address. In Atlas, open Connect → Drivers, turn on **Legacy URI String**, and use that `mongodb://` string as `MONGODB_URI` instead.

## The book resource

| Field | Type | Rules |
|---|---|---|
| `title` | String | Required, up to 120 characters, spaces around it are trimmed |
| `author` | String | Required, spaces around it are trimmed |
| `pages` | Number | Optional, a whole number of 1 or more |
| `finished` | Boolean | Optional, defaults to `false` |
| `tags` | Array of strings | Optional, defaults to `[]` |

The server adds `_id`, `createdAt` and `updatedAt` itself, so they are never sent by the client.

## Routes

| Method | Path | What it does | Success | Can fail with |
|---|---|---|---|---|
| GET | `/api/books` | List all books, newest first. `?search=text` keeps only titles containing the text | 200 | 500 |
| GET | `/api/books/:id` | Get one book | 200 | 400, 404 |
| POST | `/api/books` | Create a book | 201 | 400 |
| PUT | `/api/books/:id` | Update a book and return the new version | 200 | 400, 404 |
| DELETE | `/api/books/:id` | Delete a book | 204 | 400, 404 |

Any other path returns `404` with `{ "error": "Not found" }`.

### GET /api/books

```bash
curl -i http://localhost:3000/api/books
```

Response `200 OK`:

```json
[
  {
    "_id": "6aef5544a05ff9d936a8b82b",
    "title": "Dune",
    "author": "Herbert",
    "pages": 400,
    "finished": false,
    "tags": ["sci-fi"],
    "createdAt": "2026-11-07T16:45:00.000Z",
    "updatedAt": "2026-11-07T16:45:00.000Z",
    "__v": 0
  }
]
```

Search by title (not case sensitive):

```bash
curl -i "http://localhost:3000/api/books?search=dun"
```

### GET /api/books/:id

```bash
curl -i http://localhost:3000/api/books/6aef5544a05ff9d936a8b82b
```

Response `200 OK`: the book, in the same shape as above.

Response `404 Not Found` (a valid id that does not exist):

```json
{ "error": "Book not found" }
```

Response `400 Bad Request` (an id that is not a valid ObjectId, like `/api/books/abc`):

```json
{ "error": "Invalid id" }
```

### POST /api/books

```bash
curl -i -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Dune","author":"Herbert","pages":400,"tags":["sci-fi"]}'
```

Request body:

```json
{ "title": "Dune", "author": "Herbert", "pages": 400, "tags": ["sci-fi"] }
```

Response `201 Created`:

```json
{
  "_id": "6aef5544a05ff9d936a8b82b",
  "title": "Dune",
  "author": "Herbert",
  "pages": 400,
  "finished": false,
  "tags": ["sci-fi"],
  "createdAt": "2026-11-07T16:45:00.000Z",
  "updatedAt": "2026-11-07T16:45:00.000Z",
  "__v": 0
}
```

Response `400 Bad Request` (invalid input):

```json
{ "error": "title is required" }
```

### PUT /api/books/:id

```bash
curl -i -X PUT http://localhost:3000/api/books/6aef5544a05ff9d936a8b82b \
  -H "Content-Type: application/json" \
  -d '{"title":"Dune Messiah","author":"Herbert","finished":true}'
```

Request body (`title` and `author` are always required, the other fields are optional):

```json
{ "title": "Dune Messiah", "author": "Herbert", "finished": true }
```

Response `200 OK`: the book with the new values.

```json
{
  "_id": "6aef5544a05ff9d936a8b82b",
  "title": "Dune Messiah",
  "author": "Herbert",
  "pages": 400,
  "finished": true,
  "tags": ["sci-fi"],
  "createdAt": "2026-11-07T16:45:00.000Z",
  "updatedAt": "2026-11-07T16:50:00.000Z",
  "__v": 0
}
```

Response `400` for invalid input or an invalid id, and `404` when no book has that id.

### DELETE /api/books/:id

```bash
curl -i -X DELETE http://localhost:3000/api/books/6aef5544a05ff9d936a8b82b
```

Response `204 No Content`, with no body. Deleting the same id again returns `404`:

```json
{ "error": "Book not found" }
```

## Errors

Every error is JSON in the shape `{ "error": "message" }`.

| Status | When | Example message |
|---|---|---|
| 400 | Missing or invalid field | `title is required` |
| 400 | Title over 120 characters | `title must be 120 characters or fewer` |
| 400 | `pages` is not a whole number of 1 or more | `pages must be a whole number of 1 or more` |
| 400 | `finished` is not true or false | `finished must be true or false` |
| 400 | `tags` is not an array of strings | `tags must be an array of strings` |
| 400 | The id is not a valid ObjectId | `Invalid id` |
| 400 | The body is not valid JSON | `Request body is not valid JSON` |
| 404 | No book with that id | `Book not found` |
| 404 | The route does not exist | `Not found` |
| 500 | An unexpected server or database error | `Something went wrong on the server` |

The server does not crash on bad input or a missing record: every route is wrapped in `try/catch`, and an error handler at the end catches what happens before a route runs, like a malformed JSON body.

## Testing

With the server running, one command runs every route and checks its status code:

```bash
node docs/test-api.mjs
```

It creates a book, reads, searches, updates and deletes it, and also checks the error cases (missing title, `pages: 0`, malformed JSON, invalid id, a book that does not exist, an unknown route). It prints `PASS` or `FAIL` for each check, and `All checks passed.` at the end. It removes the book it created.

To check that the data really persists, create a book, stop the server (Ctrl + C), start it again with `npm run dev`, and `GET /api/books`. The book is still there, and you can also see it in Atlas under Browse Collections.

## Project structure

```
server.js                   starts the app: loads .env, connects to MongoDB, then listens
models/Book.js              the Mongoose schema and model
routes/books.js             the five book routes
middleware/validateBook.js  checks the body of POST and PUT
docs/test-api.mjs           runs every route and checks the status codes
.env.example                the variables a new machine needs (copy it to .env)
```