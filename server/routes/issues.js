import { Router } from 'express'
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
} from '../controllers/issueController.js'

// Mounted at /api/issues in index.js
const router = Router()

router.get('/', getIssues)
router.get('/:identifier', getIssue)
router.post('/', createIssue)
router.put('/:identifier', updateIssue)
router.delete('/:identifier', deleteIssue)

export default router
