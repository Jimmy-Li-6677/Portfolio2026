const BASE = '/api/issues'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

// filters: { teamID, status, priority, assignee, label, q } — empty values are skipped
export const getIssues = (filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
  return request(`${BASE}?${params}`)
}

export const getIssue = (identifier) => request(`${BASE}/${identifier}`)

export const createIssue = (issue) =>
  request(BASE, { method: 'POST', body: JSON.stringify(issue) })

export const updateIssue = (identifier, changes) =>
  request(`${BASE}/${identifier}`, { method: 'PUT', body: JSON.stringify(changes) })

export const deleteIssue = (identifier) => request(`${BASE}/${identifier}`, { method: 'DELETE' })
