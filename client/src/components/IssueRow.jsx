import { STATUSES, PRIORITIES, labelFor } from '../constants'

function IssueRow({ issue, onOpen, onStatusChange }) {
  return (
    <li className="issue-row" onClick={() => onOpen(issue.identifier)}>
      <span className={`priority priority-${issue.priority}`} title={labelFor(PRIORITIES, issue.priority)} />
      <span className="identifier">{issue.identifier}</span>
      {/* Change status straight from the list; stopPropagation so it doesn't open the panel */}
      <select
        className={`status-select status-${issue.status}`}
        value={issue.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(issue, e.target.value)}
        aria-label={`Status of ${issue.identifier}`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <span className="issue-title">
        {issue.title}
        {issue.parentIssue && <span className="parent">↳ {issue.parentIssue}</span>}
      </span>
      <span className="row-meta">
        {issue.labels.map((label) => (
          <span key={label} className="label">{label}</span>
        ))}
        {issue.estimate != null && <span className="estimate" title="Estimate">{issue.estimate} pt</span>}
        <span className={issue.assignee ? 'assignee' : 'assignee unassigned'}>
          {issue.assignee || 'Unassigned'}
        </span>
      </span>
    </li>
  )
}

export default IssueRow
