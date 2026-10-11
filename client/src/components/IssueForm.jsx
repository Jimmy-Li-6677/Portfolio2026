import { useState } from 'react'
import { STATUSES, PRIORITIES } from '../constants'

// Turns an issue from the API into form field values (every field is a string for the inputs)
const toFormValues = (issue) => ({
  title: issue.title ?? '',
  description: issue.description ?? '',
  status: issue.status ?? 'backlog',
  priority: issue.priority ?? 'none',
  teamID: issue.teamID ?? '',
  assignee: issue.assignee ?? '',
  creator: issue.creator ?? '',
  parentIssue: issue.parentIssue ?? '',
  labels: (issue.labels ?? []).join(', '),
  estimate: issue.estimate ?? '',
})

// Used for both creating and editing. teamID and creator can only be set when creating.
function IssueForm({ initial = {}, isNew, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { teamID, creator, ...rest } = values
    const payload = {
      ...rest,
      estimate: values.estimate === '' ? '' : Number(values.estimate),
      ...(isNew && { teamID, creator }),
    }
    setError('')
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      <input
        className="title-input"
        value={values.title}
        onChange={set('title')}
        placeholder="Issue title"
        aria-label="Title"
        required
        autoFocus={isNew}
      />
      <textarea
        value={values.description}
        onChange={set('description')}
        placeholder="Add a description…"
        aria-label="Description"
        rows={4}
      />

      <div className="field-grid">
        <label>
          Status
          <select value={values.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={values.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        {isNew && (
          <>
            <label>
              Team ID
              <input value={values.teamID} onChange={set('teamID')} placeholder="ENG" required />
            </label>
            <label>
              Creator
              <input value={values.creator} onChange={set('creator')} placeholder="Your name" required />
            </label>
          </>
        )}
        <label>
          Assignee
          <input value={values.assignee} onChange={set('assignee')} placeholder="Unassigned" />
        </label>
        <label>
          Estimate (points)
          <input type="number" min="0" value={values.estimate} onChange={set('estimate')} placeholder="—" />
        </label>
        <label>
          Parent issue
          <input value={values.parentIssue} onChange={set('parentIssue')} placeholder="e.g. ENG-1" />
        </label>
        <label>
          Labels
          <input value={values.labels} onChange={set('labels')} placeholder="bug, frontend" />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  )
}

export default IssueForm
