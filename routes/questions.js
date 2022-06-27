import { Router } from "express";
import {
  createQuestion,
  createResponse,
  deleteDislike,
  deleteLike,
  deleteResponseDislike,
  deleteResponseLike,
  dislike,
  getHotQuestions,
  getHotQuestionsLikesAndDislikes,
  getLikesAndDislikes,
  getLikesById,
  getQuestion,
  getQuestions,
  getReponses,
  getResponse,
  getResponseLikesAndDislikes,
  getResponsesLikesAndDislikes,
  getTotalNumberOfQuestions,
  like,
  responseDislike,
  responseLike,
} from "../controllers/questions.js";
import { isAuth } from "../middleware/is-auth.js";

const router = Router();

router.get("/", getQuestions);
router.post("/", isAuth, createQuestion);
router.get("/totalQuestions", getTotalNumberOfQuestions);
router.get("/hotQuestions", getHotQuestions);
router.get("/hotQuestions/likes", getHotQuestionsLikesAndDislikes);
router.get("/getLikesAndDislikes", getLikesAndDislikes);
router.get("/:id", getQuestion);
router.post("/:id", isAuth, createResponse);
router.get("/:id/likes", getLikesById);
router.get("/:id/responses", getReponses);
router.get("/:id/responses/likes", getResponsesLikesAndDislikes);
router.get("/:id/responses/:responseId", getResponse);
router.get("/:id/responses/:responseId/likes", getResponseLikesAndDislikes);

//actions on questions - like and dislike functionality
router.post("/:id/like", isAuth, like);
router.delete("/:id/like", isAuth, deleteLike);
router.post("/:id/dislike", isAuth, dislike);
router.delete("/:id/dislike", isAuth, deleteDislike);

//actions on responses - like and dislike functionality
router.post("/:id/response/:responseId/like", isAuth, responseLike);
router.delete("/:id/response/:responseId/like", isAuth, deleteResponseLike);
router.post("/:id/response/:responseId/dislike", isAuth, responseDislike);
router.delete(
  "/:id/response/:responseId/dislike",
  isAuth,
  deleteResponseDislike
);

export default router;
