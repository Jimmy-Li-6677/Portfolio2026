import { useEffect, useState } from 'react'
import { getHello, getTodos, createTodo, updateTodo, deleteTodo } from './api'
import './App.css'

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  const save = () => {
    const title = draft.trim()
    if (title && title !== todo.title) onRename(todo.taskId, title)
    else setDraft(todo.title)
    setEditing(false)
  }

  return (
    <li className={todo.completed ? 'todo done' : 'todo'}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'not done' : 'done'}`}
      />
      <div className="body">
        {editing ? (
          <input
            className="edit"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') {
                setDraft(todo.title)
                setEditing(false)
              }
            }}
          />
        ) : (
          <span className="title" onDoubleClick={() => setEditing(true)}>
            {todo.title}
          </span>
        )}
        {todo.description && <p className="description">{todo.description}</p>}
        <p className="meta">
          #{todo.taskId.slice(-6)} · by {todo.createdBy} ·{' '}
          {new Date(todo.createdAt).toLocaleString()}
        </p>
      </div>
      <button className="link" onClick={() => setEditing(true)}>Edit</button>
      <button className="link danger" onClick={() => onDelete(todo.taskId)}>Delete</button>
    </li>
  )
}

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [createdBy, setCreatedBy] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hello, setHello] = useState(null)

  const handleHello = () =>
    run(async () => {
      const data = await getHello('Jimmy')
      setHello(data)
    })

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Run an API call and surface any error in the UI
  const run = async (fn) => {
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!title.trim() || !createdBy.trim()) {
      setError('Please enter a task and who created it')
      return
    }
    run(async () => {
      const todo = await createTodo({ title, description, createdBy })
      setTodos((prev) => [...prev, todo])
      // Keep createdBy filled in so the same person can add several tasks
      setTitle('')
      setDescription('')
    })
  }

  const handleToggle = (todo) =>
    run(async () => {
      const updated = await updateTodo(todo.taskId, { completed: !todo.completed })
      setTodos((prev) => prev.map((t) => (t.taskId === updated.taskId ? updated : t)))
    })

  const handleRename = (id, newTitle) =>
    run(async () => {
      const updated = await updateTodo(id, { title: newTitle })
      setTodos((prev) => prev.map((t) => (t.taskId === updated.taskId ? updated : t)))
    })

  const handleDelete = (id) =>
    run(async () => {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.taskId !== id))
    })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <main className="app">
      <h1>Todo List</h1>

      <button onClick={handleHello}>Say hello to the server</button>
      {hello && (
        <p className="muted">
          {hello.message} (server time: {hello.serverTime})
        </p>
      )}

      <form className="add" onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="Task"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is it for? (optional)"
          aria-label="What the task is for"
        />
        <input
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          placeholder="Your name"
          aria-label="Created by"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : todos.length === 0 ? (
        <p className="muted">No todos yet. Add one above.</p>
      ) : (
        <>
          <ul className="list">
            {todos.map((todo) => (
              <TodoItem
                key={todo.taskId}
                todo={todo}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </ul>
          <p className="muted">{remaining} of {todos.length} remaining</p>
        </>
      )}
    </main>
  )
}

export default App
