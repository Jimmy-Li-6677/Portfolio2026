import mongoose from 'mongoose'

export const STATUSES = ['backlog', 'todo', 'in_progress', 'done', 'canceled']
export const PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent']

const issueSchema = new mongoose.Schema(
  {
    // Human-friendly id such as "ENG-3", built from teamID + a per-team number
    identifier: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: STATUSES, default: 'backlog' },
    priority: { type: String, enum: PRIORITIES, default: 'none' },
    teamID: { type: String, required: true, trim: true, uppercase: true },
    assignee: { type: String, trim: true, default: null },
    creator: { type: String, required: true, trim: true },
    // identifier of the parent issue, e.g. "ENG-1"
    parentIssue: { type: String, trim: true, default: null },
    labels: { type: [String], default: [] },
    // Story points
    estimate: { type: Number, min: 0, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

export const Issue = mongoose.model('Issue', issueSchema)
