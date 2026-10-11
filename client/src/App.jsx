import { useEffect, useState } from 'react'
import { getIssues, createIssue, updateIssue, deleteIssue } from './api'
import { STATUSES, PRIORITIES } from './constants'
import IssueForm from './components/IssueForm'
import IssuePanel from './components/IssuePanel'
import IssueRow from './components/IssueRow'
import './App.css'

const EMPTY_FILTERS = { q: '', teamID: '', priority: '', assignee: '' }

// Remember who is using the app so "Creator" is pre-filled. Storage can be unavailable (private mode).
const ME_KEY = 'issue-tracker:me'
const loadMe = () => {
  try {
    return localStorage.getItem(ME_KEY) || ''
  } catch {
    return ''
  }
}
const saveMe = (name) => {
  try {
    localStorage.setItem(ME_KEY, name)
  } catch {
    // ignore
  }
}

function App() {
  const [issues, setIssues] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // What the side panel shows: null, { mode: 'create', defaults } or { mode: 'edit', identifier }
  const [panel, setPanel] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Re-fetch when filters change or after any create/update/delete.
  // The short delay avoids a request on every keystroke in the search box.
  useEffect(() => {
    const timer = setTimeout(() => {
      getIssues(filters)
        .then(setIssues)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [filters, refreshKey])

  const refresh = () => setRefreshKey((k) => k + 1)

  // Run an API call and reload the list afterwards. Errors are re-thrown so the caller decides
  // where to show them: forms show their own, list actions use the banner.
  const run = async (fn) => {
    setError('')
    await fn()
    refresh()
  }
  const showError = (err) => setError(err.message)

  const setFilter = (field) => (e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))

  const openCreate = (defaults = {}) =>
    setPanel({ mode: 'create', defaults: { creator: loadMe(), teamID: 'ENG', ...defaults } })

  const handleCreate = (values) =>
    run(async () => {
      const issue = await createIssue(values)
      saveMe(values.creator)
      setPanel({ mode: 'edit', identifier: issue.identifier })
    })

  const handleSave = (identifier, changes) => run(() => updateIssue(identifier, changes))

  const handleStatusChange = (issue, status) =>
    run(() => updateIssue(issue.identifier, { status })).catch(showError)

  const handleDelete = (identifier) =>
    run(async () => {
      await deleteIssue(identifier)
      setPanel(null)
    }).catch(showError)

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className={panel ? 'layout with-panel' : 'layout'}>
      <main className="main">
        <header className="top-bar">
          <h1>Issues</h1>
          <button onClick={() => openCreate()}>+ New issue</button>
        </header>

        <div className="filters">
          <input value={filters.q} onChange={setFilter('q')} placeholder="Search…" aria-label="Search" />
          <input value={filters.teamID} onChange={setFilter('teamID')} placeholder="Team" aria-label="Team" />
          <select value={filters.priority} onChange={setFilter('priority')} aria-label="Priority">
            <option value="">Any priority</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input value={filters.assignee} onChange={setFilter('assignee')} placeholder="Assignee" aria-label="Assignee" />
          {hasFilters && (
            <button className="link" onClick={() => setFilters(EMPTY_FILTERS)}>Clear</button>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : issues.length === 0 ? (
          <p className="muted empty">
            {hasFilters ? 'No issues match these filters.' : 'No issues yet. Create your first one.'}
          </p>
        ) : (
          STATUSES.map((status) => {
            const group = issues.filter((issue) => issue.status === status.value)
            if (group.length === 0) return null
            return (
              <section key={status.value} className="group">
                <h2 className={`group-title status-${status.value}`}>
                  {status.label} <span className="count">{group.length}</span>
                </h2>
                <ul className="issue-list">
                  {group.map((issue) => (
                    <IssueRow
                      key={issue.identifier}
                      issue={issue}
                      onOpen={(identifier) => setPanel({ mode: 'edit', identifier })}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </ul>
              </section>
            )
          })
        )}
      </main>

      {panel?.mode === 'create' && (
        <aside className="panel" aria-label="New issue">
          <header className="panel-header">
            <h2>New issue</h2>
            <button className="icon" onClick={() => setPanel(null)} aria-label="Close">×</button>
          </header>
          <IssueForm
            key={JSON.stringify(panel.defaults)}
            initial={panel.defaults}
            isNew
            submitLabel="Create issue"
            onSubmit={handleCreate}
            onCancel={() => setPanel(null)}
          />
        </aside>
      )}

      {panel?.mode === 'edit' && (
        <IssuePanel
          identifier={panel.identifier}
          refreshKey={refreshKey}
          onSave={handleSave}
          onDelete={handleDelete}
          onOpen={(identifier) => setPanel({ mode: 'edit', identifier })}
          onAddSubIssue={(parent) =>
            openCreate({ teamID: parent.teamID, parentIssue: parent.identifier })
          }
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}

export default App
