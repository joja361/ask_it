import { Router } from "express"
import { getPeopleWithMostReponses } from "../controllers/other.js"
import pool from "../db.js"
import auth from './auth.js'
import questions from './questions.js'

const router = Router()

router.use('/auth', auth)
router.use('/questions', questions)
router.get('/most-responses', getPeopleWithMostReponses)
router.get('/get-it', async (req, res, next) => {
    try {
        const text = `SELECT email FROM account`
        const {rows: test} = await pool.query(text)
        res.send(test)
    } catch(err) {
        res.send(err)
    }
})

export default router