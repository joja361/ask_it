import { Router } from "express";
import auth from "./auth.js";
import questions from "./questions.js";
import user from "./user.js";

const router = Router();

router.use("/auth", auth);
router.use("/user", user);
router.use("/questions", questions);

export default router;
