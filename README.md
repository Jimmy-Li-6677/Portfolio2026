# Portfolio2026 – Todo App

A small full-stack CRUD demo: a **React** (Vite) front end and a **Node.js** (Express) back end.

```
client/   React UI (Vite) – runs on http://localhost:5173
server/   Express REST API – runs on http://localhost:3001
```

## Getting started

Requires Node.js 20+.

```bash
npm run install:all   # install root, server and client dependencies
npm run dev           # start the API and the UI together
```

Open http://localhost:5173. During development, Vite forwards `/api` requests to the server.

## API

| Method | Endpoint          | Body                                | Description       |
| ------ | ----------------- | ----------------------------------- | ----------------- |
| GET    | `/api/todos`      |                                     | List all todos    |
| GET    | `/api/todos/:id`  |                                     | Get one todo      |
| POST   | `/api/todos`      | `{ "title": "..." }`                | Create a todo     |
| PUT    | `/api/todos/:id`  | `{ "title"?: "...", "completed"?: true }` | Update a todo |
| DELETE | `/api/todos/:id`  |                                     | Delete a todo     |

Data is stored in memory, so it resets when the server restarts.
