import { Router } from "express";
import {
  getMyQuestions,
  getTotalNumberOfMyQuestions,
  isMyQuestion,
} from "../controllers/user.js";
import { isAuth } from "../middleware/is-auth.js";

const router = Router();

router.get("/:user", isAuth, isMyQuestion, getMyQuestions);
router.get("/:user/totalQuestions", isAuth, getTotalNumberOfMyQuestions);

export default router;
