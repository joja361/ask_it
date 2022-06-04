import { Router } from "express";
import { createQuestion, createResponse, getMyQuestions, getQuestion, getQuestions, getReponses, likeQuestion } from "../controllers/questions.js";
import { isAuth } from "../middleware/is-auth.js";

const router = Router()

router.get('/', getQuestions)
router.post('/', isAuth, createQuestion)
router.get('/:id', isAuth, getQuestion)
router.get('/:id/responses', isAuth, getReponses )
router.post('/:id', isAuth, createResponse )
router.post('/:id/like', isAuth, likeQuestion)
router.get('/:userId', isAuth, getMyQuestions)

export default router