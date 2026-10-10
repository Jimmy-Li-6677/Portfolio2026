import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // What the task is for
    description: { type: String, trim: true, default: '' },
    createdBy: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  {
    // Adds createdAt and updatedAt automatically
    timestamps: true,
    // Send MongoDB's _id to the client as taskId, and drop the internal __v field
    toJSON: {
      transform: (doc, ret) => {
        ret.taskId = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

export const Task = mongoose.model('Task', taskSchema)
