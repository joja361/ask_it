import { Router } from "express";
import {
  getMyLikesAndDislikes,
  getMyQuestions,
  getTotalNumberOfMyQuestions,
  getUser,
  getUsersHotQuestions,
  getUsersWithMostResponses,
} from "../controllers/user.js";
import { isAuth } from "../middleware/is-auth.js";

const router = Router();

router.get("/usersWithMostResponses", getUsersWithMostResponses);
router.get("/:userId/questions", isAuth, getMyQuestions);
router.get("/:userId/hotQuestions", getUsersHotQuestions);
router.get("/:userId/getLikesAndDislikes", isAuth, getMyLikesAndDislikes);
router.get("/:userId/totalQuestions", isAuth, getTotalNumberOfMyQuestions);
router.get("/:userId", getUser);

export default router;
