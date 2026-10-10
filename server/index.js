import express from 'express'
import mongoose from 'mongoose'
import { Task } from './models/Task.js'

const app = express()
const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio'

app.use(express.json())

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

// Looks up a task by its id; sends a 404 and returns null if it doesn't exist
const findTask = async (id, res) => {
  const task = mongoose.isValidObjectId(id) ? await Task.findById(id) : null
  if (!task) res.status(404).json({ error: 'Task not found' })
  return task
}

// Simple demo endpoint: GET /api/hello?name=Jimmy
app.get('/api/hello', (req, res) => {
  const name = req.query.name || 'stranger'
  console.log(`[server] GET /api/hello received, name=${name}`)
  res.json({ message: `Hello, ${name}!`, serverTime: new Date().toISOString() })
})

app.get('/api/todos', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: 1 })
  res.json(tasks)
})

app.get('/api/todos/:id', async (req, res) => {
  const task = await findTask(req.params.id, res)
  if (task) res.json(task)
})

app.post('/api/todos', async (req, res) => {
  const { title, description, createdBy } = req.body
  if (!isNonEmptyString(title)) return res.status(400).json({ error: 'Title is required' })
  if (!isNonEmptyString(createdBy)) return res.status(400).json({ error: 'Created by is required' })
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' })
  }

  const task = await Task.create({ title, description, createdBy })
  res.status(201).json(task)
})

app.put('/api/todos/:id', async (req, res) => {
  const { title, description, completed } = req.body
  if (title !== undefined && !isNonEmptyString(title)) {
    return res.status(400).json({ error: 'Title must be a non-empty string' })
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' })
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be true or false' })
  }

  const task = await findTask(req.params.id, res)
  if (!task) return

  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (completed !== undefined) task.completed = completed
  await task.save()
  res.json(task)
})

app.delete('/api/todos/:id', async (req, res) => {
  const task = await findTask(req.params.id, res)
  if (!task) return

  await task.deleteOne()
  res.status(204).end()
})

// Express 5 forwards errors from async handlers here
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

try {
  // Fail after 5s instead of Mongoose's default 30s so connection problems show up quickly
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  console.log('Connected to MongoDB')
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`)
  })
} catch (err) {
  // Hide the password if the connection string has one
  const safeUri = MONGODB_URI.replace(/\/\/([^:/@]+):[^@]+@/, '//$1:****@')
  console.error(`Could not connect to MongoDB at ${safeUri}:`, err.message)
  process.exit(1)
}
