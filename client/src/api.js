const BASE = '/api/todos'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export const getHello = (name) =>
  request(`/api/hello?name=${encodeURIComponent(name)}`)

export const getTodos = () => request(BASE)

export const createTodo = ({ title, description, createdBy }) =>
  request(BASE, { method: 'POST', body: JSON.stringify({ title, description, createdBy }) })

export const updateTodo = (id, changes) =>
  request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(changes) })

export const deleteTodo = (id) => request(`${BASE}/${id}`, { method: 'DELETE' })
