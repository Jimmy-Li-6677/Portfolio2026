import express from 'express'
import mongoose from 'mongoose'
import issueRoutes from './routes/issues.js'

const app = express()
const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio'

app.use(express.json())

app.use('/api/issues', issueRoutes)

// Express 5 forwards errors from async handlers here
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong on the server' })
})

try {
  // Fail after 5s instead of Mongoose's default 30s so connection problems show up quickly
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  console.log('Connected to MongoDB')
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`)
  })
} catch (err) {
  // Hide the password if the connection string has one
  const safeUri = MONGODB_URI.replace(/\/\/([^:/@]+):[^@]+@/, '//$1:****@')
  console.error(`Could not connect to MongoDB at ${safeUri}:`, err.message)
  process.exit(1)
}
