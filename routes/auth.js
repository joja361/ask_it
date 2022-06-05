import { Router } from "express";
import { login, resetPassword, signup } from "../controllers/auth.js";
import { isAuth } from "../middleware/is-auth.js";
import { validateLogin, validateResetPassword, validateSignup } from "../util/validation.js";

const router = Router()

router.post('/signup', validateSignup,signup)

router.get('/login', validateLogin, login)

router.put('/reset-password', isAuth, validateResetPassword,
resetPassword)

export default router