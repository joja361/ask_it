import { body } from "express-validator";

export const validateSignup = [
  body("email").isEmail().withMessage("Please enter correct email address."),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be minimum of 5 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password must match.");
    }
    return true;
  }),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Please enter correct email address."),
];

export const validateResetPassword = [
  body("newPassword")
    .isLength({ min: 5 })
    .withMessage("Password must be minimum of 5 characters"),
];
