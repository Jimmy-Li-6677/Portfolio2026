import { Issue } from '../models/Issue.js'
import { nextIssueNumber } from '../models/Counter.js'

// Fields the client may set when updating; identifier, teamID and creator are fixed after creation
const UPDATABLE_FIELDS = [
  'title',
  'description',
  'status',
  'priority',
  'assignee',
  'parentIssue',
  'labels',
  'estimate',
]

// Mongoose validation errors are the client's fault (400), anything else is ours (500)
const sendError = (res, label, error) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message })
  }
  console.error(`${label} error:`, error)
  res.status(500).json({ message: 'Server error' })
}

const toIdentifier = (value) => String(value).trim().toUpperCase()

// Empty strings from form fields mean "not set"
const orNull = (value) => (value === '' || value === undefined ? null : value)

// Labels may arrive as an array or a comma-separated string: "bug, ui" -> ['bug', 'ui']
const normalizeLabels = (labels) => {
  const list = Array.isArray(labels) ? labels : String(labels ?? '').split(',')
  return [...new Set(list.map((label) => String(label).trim().toLowerCase()).filter(Boolean))]
}

// Returns an error message if parentIssue is not allowed for this issue, otherwise null.
// Walks up the parent chain so ENG-1 -> ENG-2 -> ENG-1 loops are rejected.
const checkParent = async (parentIssue, identifier) => {
  if (!parentIssue) return null
  if (parentIssue === identifier) return 'An issue cannot be its own parent'
  if (!(await Issue.exists({ identifier: parentIssue }))) {
    return `Parent issue ${parentIssue} does not exist`
  }

  let current = parentIssue
  while (current) {
    if (current === identifier) return `${parentIssue} is already a sub-issue of ${identifier}`
    const ancestor = await Issue.findOne({ identifier: current }, 'parentIssue')
    current = ancestor?.parentIssue
  }
  return null
}

export const getIssues = async (req, res) => {
  try {
    // Optional filters: /api/issues?teamID=ENG&status=todo&priority=high&assignee=Jimmy&label=bug&q=login
    const { teamID, status, priority, assignee, label, q } = req.query
    const filter = {}
    if (teamID) filter.teamID = toIdentifier(teamID)
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignee) filter.assignee = assignee
    if (label) filter.labels = label.toLowerCase()
    if (q) {
      // Escape regex special characters so a search for "a+b" matches literally
      const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ title: pattern }, { description: pattern }, { identifier: pattern }]
    }

    const issues = await Issue.find(filter).sort({ updatedAt: -1 })
    res.json(issues)
  } catch (error) {
    sendError(res, 'Get issues', error)
  }
}

export const getIssue = async (req, res) => {
  try {
    const identifier = toIdentifier(req.params.identifier)
    const issue = await Issue.findOne({ identifier })
    if (!issue) return res.status(404).json({ message: 'Issue not found' })

    const subIssues = await Issue.find({ parentIssue: identifier }).sort({ createdAt: 1 })
    res.json({ ...issue.toJSON(), subIssues })
  } catch (error) {
    sendError(res, 'Get issue', error)
  }
}

export const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      teamID,
      assignee,
      creator,
      parentIssue,
      labels,
      estimate,
    } = req.body

    if (!title?.trim() || !teamID?.trim() || !creator?.trim()) {
      return res.status(400).json({ message: 'title, teamID and creator are required' })
    }

    const team = toIdentifier(teamID)
    const parent = parentIssue ? toIdentifier(parentIssue) : null

    const parentError = await checkParent(parent)
    if (parentError) return res.status(400).json({ message: parentError })

    // Number issues per team: ENG-1, ENG-2, ... and DES-1, DES-2, ...
    const identifier = `${team}-${await nextIssueNumber(team)}`

    const issue = await Issue.create({
      identifier,
      title,
      description,
      // undefined lets the schema default ('backlog' / 'none') apply
      status: status || undefined,
      priority: priority || undefined,
      teamID: team,
      assignee: orNull(assignee),
      creator,
      parentIssue: parent,
      labels: normalizeLabels(labels),
      estimate: orNull(estimate),
    })

    res.status(201).json(issue)
  } catch (error) {
    sendError(res, 'Create issue', error)
  }
}

export const updateIssue = async (req, res) => {
  try {
    const identifier = toIdentifier(req.params.identifier)
    const updates = {}
    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }

    if (updates.title !== undefined && !String(updates.title).trim()) {
      return res.status(400).json({ message: 'title cannot be empty' })
    }
    if (updates.labels !== undefined) updates.labels = normalizeLabels(updates.labels)
    if (updates.assignee !== undefined) updates.assignee = orNull(updates.assignee)
    if (updates.estimate !== undefined) updates.estimate = orNull(updates.estimate)
    if (updates.parentIssue !== undefined) {
      updates.parentIssue = updates.parentIssue ? toIdentifier(updates.parentIssue) : null
      const parentError = await checkParent(updates.parentIssue, identifier)
      if (parentError) return res.status(400).json({ message: parentError })
    }

    const issue = await Issue.findOneAndUpdate(
      { identifier },
      updates,
      // new: return the updated document; runValidators: apply the schema rules (enum, min) on update too
      { new: true, runValidators: true }
    )
    if (!issue) return res.status(404).json({ message: 'Issue not found' })

    res.json(issue)
  } catch (error) {
    sendError(res, 'Update issue', error)
  }
}

export const deleteIssue = async (req, res) => {
  try {
    const identifier = toIdentifier(req.params.identifier)
    const issue = await Issue.findOneAndDelete({ identifier })
    if (!issue) return res.status(404).json({ message: 'Issue not found' })

    // Sub-issues become top-level issues instead of pointing at a parent that no longer exists
    await Issue.updateMany({ parentIssue: identifier }, { parentIssue: null })
    res.status(204).end()
  } catch (error) {
    sendError(res, 'Delete issue', error)
  }
}
