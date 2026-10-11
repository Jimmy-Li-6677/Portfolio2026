import mongoose from 'mongoose'

// One document per team holding the last issue number handed out, e.g. { _id: 'ENG', seq: 7 }.
// Counting existing issues instead would reuse numbers after a delete (ENG-2 deleted -> next is ENG-2 again).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

const Counter = mongoose.model('Counter', counterSchema)

// $inc is atomic, so two requests at the same moment always get different numbers
export const nextIssueNumber = async (teamID) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: teamID },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return counter.seq
}
