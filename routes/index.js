import { Router } from "express"
import { getPeopleWithMostReponses } from "../controllers/other.js"
import auth from './auth.js'
import questions from './questions.js'

const router = Router()

router.use('/auth', auth)
router.use('/questions', questions)
router.get('/most-responses', getPeopleWithMostReponses)

export default router