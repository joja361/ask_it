import { Router } from "express";
import {
  createQuestion,
  createResponse,
  getQuestion,
  getQuestions,
  getReponses,
  getTotalNumberOfQuestions,
  likeQuestion,
} from "../controllers/questions.js";
import { isAuth } from "../middleware/is-auth.js";

const router = Router();

router.get("/", getQuestions);
router.get("/totalQuestions", getTotalNumberOfQuestions);
router.get("/:id", getQuestion);
router.post("/", isAuth, createQuestion);
router.post("/:id", isAuth, createResponse);
router.get("/:id/responses", getReponses);
router.post("/:id/like", isAuth, likeQuestion);

export default router;

//questions/:id POST
