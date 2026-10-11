import { useEffect, useState } from 'react'
import { getIssue } from '../api'
import { STATUSES, labelFor } from '../constants'
import IssueForm from './IssueForm'

// Side panel that shows one existing issue: edit form, sub-issues and delete
function IssuePanel({ identifier, refreshKey, onSave, onDelete, onOpen, onAddSubIssue, onClose }) {
  const [loaded, setLoaded] = useState(null)
  const [error, setError] = useState('')
  // Ignore the previously loaded issue while a different one is being fetched
  const issue = loaded?.identifier === identifier ? loaded : null

  // refreshKey changes after every save so the panel re-fetches (e.g. a sub-issue's new status)
  useEffect(() => {
    setError('')
    getIssue(identifier).then(setLoaded).catch((err) => setError(err.message))
  }, [identifier, refreshKey])

  const handleDelete = () => {
    if (window.confirm(`Delete ${identifier}? Its sub-issues will be kept.`)) onDelete(identifier)
  }

  return (
    <aside className="panel" aria-label={`Issue ${identifier}`}>
      <header className="panel-header">
        <h2>{identifier}</h2>
        <button className="icon" onClick={onClose} aria-label="Close">×</button>
      </header>

      {error && <p className="error">{error}</p>}
      {!issue && !error && <p className="muted">Loading…</p>}

      {issue && (
        <>
          {/* key resets the form's state when a different issue (or a fresh copy) is loaded */}
          <IssueForm
            key={`${issue.identifier}-${issue.updatedAt}`}
            initial={issue}
            submitLabel="Save changes"
            onSubmit={(changes) => onSave(identifier, changes)}
          />

          <p className="meta">
            {issue.teamID} · created by {issue.creator} on {new Date(issue.createdAt).toLocaleString()}
            <br />
            Last updated {new Date(issue.updatedAt).toLocaleString()}
          </p>

          <section className="sub-issues">
            <div className="section-header">
              <h3>Sub-issues ({issue.subIssues.length})</h3>
              <button className="link" onClick={() => onAddSubIssue(issue)}>+ Add sub-issue</button>
            </div>
            <ul>
              {issue.subIssues.map((sub) => (
                <li key={sub.identifier}>
                  <button className="link" onClick={() => onOpen(sub.identifier)}>
                    {sub.identifier}
                  </button>{' '}
                  {sub.title} <span className="muted">· {labelFor(STATUSES, sub.status)}</span>
                </li>
              ))}
            </ul>
          </section>

          <button className="danger" onClick={handleDelete}>Delete issue</button>
        </>
      )}
    </aside>
  )
}

export default IssuePanel
