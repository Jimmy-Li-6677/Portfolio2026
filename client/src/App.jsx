import { useEffect, useState } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo } from './api'
import './App.css'

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  const save = () => {
    const title = draft.trim()
    if (title && title !== todo.title) onRename(todo.id, title)
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
      <button className="link" onClick={() => setEditing(true)}>Edit</button>
      <button className="link danger" onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  )
}

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    const trimmed = title.trim()
    if (!trimmed) return
    run(async () => {
      const todo = await createTodo(trimmed)
      setTodos((prev) => [...prev, todo])
      setTitle('')
    })
  }

  const handleToggle = (todo) =>
    run(async () => {
      const updated = await updateTodo(todo.id, { completed: !todo.completed })
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    })

  const handleRename = (id, newTitle) =>
    run(async () => {
      const updated = await updateTodo(id, { title: newTitle })
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    })

  const handleDelete = (id) =>
    run(async () => {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <main className="app">
      <h1>Todo List</h1>

      <form className="add" onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
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
                key={todo.id}
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
