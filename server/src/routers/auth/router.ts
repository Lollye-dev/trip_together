import express from "express";
import { login, verify } from "../../modules/auth/authActions";
import { verifyToken } from "../../modules/auth/authMiddleware";
import { hashPassword } from "../../modules/auth/authService";
import userActions from "../../modules/user/userActions";

const router = express.Router();

router.post("/register", hashPassword, userActions.add);
router.post("/login", login);
router.get("/verify", verifyToken, verify);

export default router;
