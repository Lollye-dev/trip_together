import express from "express";
import { verifyToken } from "../../modules/auth/authMiddleware";
import { hashPassword } from "../../modules/auth/authService";
import tripActions from "../../modules/trip/tripActions";
import userActions from "../../modules/user/userActions";

const router = express.Router();

router.post("/", hashPassword, userActions.add);
router.get("/", userActions.browse);

router.get("/my-trips", verifyToken, tripActions.browseTheTrip);

router.get("/:id", userActions.read);

export default router;
