import express from 'express'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// In-memory store: data resets whenever the server restarts
let todos = [
  { id: 1, title: 'Try adding a todo', completed: false },
  { id: 2, title: 'Double-click a todo to edit it', completed: false },
]
let nextId = 3

const findTodo = (id) => todos.find((t) => t.id === Number(id))

app.get('/api/todos', (req, res) => {
  res.json(todos)
})

app.get('/api/todos/:id', (req, res) => {
  const todo = findTodo(req.params.id)
  if (!todo) return res.status(404).json({ error: 'Todo not found' })
  res.json(todo)
})

app.post('/api/todos', (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
  if (!title) return res.status(400).json({ error: 'Title is required' })

  const todo = { id: nextId++, title, completed: false }
  todos.push(todo)
  res.status(201).json(todo)
})

app.put('/api/todos/:id', (req, res) => {
  const todo = findTodo(req.params.id)
  if (!todo) return res.status(404).json({ error: 'Todo not found' })

  const { title, completed } = req.body
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'Title must be a non-empty string' })
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be true or false' })
  }

  if (title !== undefined) todo.title = title.trim()
  if (completed !== undefined) todo.completed = completed
  res.json(todo)
})

app.delete('/api/todos/:id', (req, res) => {
  const todo = findTodo(req.params.id)
  if (!todo) return res.status(404).json({ error: 'Todo not found' })

  todos = todos.filter((t) => t !== todo)
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
