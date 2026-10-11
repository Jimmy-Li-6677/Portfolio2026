# Portfolio2026 – Issue Tracker

A small issue tracker for keeping track of the issues you work on each day: a **React** (Vite) front end, a **Node.js** (Express) back end, and **MongoDB** for storage.

```
client/   React UI (Vite) – runs on http://localhost:5173
  src/App.jsx              list, filters, grouping by status
  src/components/          IssueForm, IssueRow, IssuePanel
server/   Express REST API – runs on http://localhost:3001
  routes/issues.js         URL -> controller function
  controllers/             request handling and validation
  models/                  Mongoose schemas (Issue, Counter)
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

## Issue fields

Each issue is saved in the `issues` collection:

| Field         | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `identifier`  | Human-friendly id like `ENG-3`, generated per team (never reused)  |
| `title`       | Required                                                           |
| `description` | Optional details                                                   |
| `status`      | `backlog` (default), `todo`, `in_progress`, `done`, `canceled`     |
| `priority`    | `none` (default), `low`, `medium`, `high`, `urgent`                |
| `teamID`      | Required, e.g. `ENG`; fixed after creation                         |
| `assignee`    | Who is working on it (optional)                                    |
| `creator`     | Required; fixed after creation                                     |
| `parentIssue` | Identifier of the parent issue, e.g. `ENG-1` (optional)            |
| `labels`      | List of tags, e.g. `["bug", "ui"]`                                 |
| `estimate`    | Story points (optional, 0 or more)                                 |
| `createdAt`   | Set automatically                                                  |
| `updatedAt`   | Set automatically                                                  |

Issue numbers come from a per-team counter in the `counters` collection, so deleting `ENG-2` doesn't make the next issue `ENG-2` again.

## API

| Method | Endpoint                    | Description                                                        |
| ------ | --------------------------- | ------------------------------------------------------------------ |
| GET    | `/api/issues`               | List issues. Optional query: `teamID`, `status`, `priority`, `assignee`, `label`, `q` (text search) |
| GET    | `/api/issues/:identifier`   | Get one issue, plus its `subIssues`                                |
| POST   | `/api/issues`               | Create an issue. `title`, `teamID`, `creator` are required         |
| PUT    | `/api/issues/:identifier`   | Update any of `title`, `description`, `status`, `priority`, `assignee`, `parentIssue`, `labels`, `estimate` |
| DELETE | `/api/issues/:identifier`   | Delete an issue; its sub-issues become top-level issues            |

Identifiers are case-insensitive (`eng-1` works). Errors return `{ "message": "..." }` with status 400 (bad input), 404 (not found) or 500.

Example:

```bash
curl -X POST http://localhost:3001/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Login button broken","teamID":"ENG","creator":"Jimmy","priority":"high","labels":["bug"]}'
```
