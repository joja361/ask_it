import { Router } from "express";
import {
  getMyQuestions,
  getTotalNumberOfQuestions,
  isMyQuestion,
} from "../controllers/user.js";
import { isAuth } from "../middleware/is-auth.js";

const router = Router();

router.get("/:user", isAuth, isMyQuestion, getMyQuestions);
router.get("/:user/totalQuestions", isAuth, getTotalNumberOfQuestions);

export default router;
