import express from "express";
import { login } from "../../modules/auth/authActions";
import { hashPassword } from "../../modules/auth/authService";
import userActions from "../../modules/user/userActions";

const router = express.Router();

router.post("/register", hashPassword, userActions.add);
router.post("/login", login);

export default router;
