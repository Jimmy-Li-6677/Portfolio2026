# Portfolio2026 – Todo App

A small full-stack CRUD demo: a **React** (Vite) front end, a **Node.js** (Express) back end, and **MongoDB** for storage.

```
client/   React UI (Vite) – runs on http://localhost:5173
server/   Express REST API – runs on http://localhost:3001
```

## Getting started

Requires Node.js 22+ and a MongoDB database (local install or a free MongoDB Atlas cluster).

1. Point the server at your database. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`.
   Without a `.env` file, the server uses `mongodb://127.0.0.1:27017/portfolio`.
2. Install and run:

```bash
npm run install:all   # install root, server and client dependencies
npm run dev           # start the API and the UI together
```

Open http://localhost:5173. During development, Vite forwards `/api` requests to the server.

## Task fields

Each task is saved in the `tasks` collection:

| Field         | Description                                   |
| ------------- | --------------------------------------------- |
| `taskId`      | MongoDB's `_id`, sent to the client as a string |
| `title`       | The task                                      |
| `description` | What the task is for (optional)               |
| `createdBy`   | Who created it                                |
| `completed`   | Whether it is done                            |
| `createdAt`   | When it was created (set automatically)       |
| `updatedAt`   | When it was last changed (set automatically)  |

## API

| Method | Endpoint          | Body                                                     | Description     |
| ------ | ----------------- | -------------------------------------------------------- | --------------- |
| GET    | `/api/todos`      |                                                          | List all tasks  |
| GET    | `/api/todos/:id`  |                                                          | Get one task    |
| POST   | `/api/todos`      | `{ "title": "...", "createdBy": "...", "description"?: "..." }` | Create a task |
| PUT    | `/api/todos/:id`  | `{ "title"?: "...", "description"?: "...", "completed"?: true }` | Update a task |
| DELETE | `/api/todos/:id`  |                                                          | Delete a task   |
| GET    | `/api/hello?name=` |                                                         | Demo endpoint   |
