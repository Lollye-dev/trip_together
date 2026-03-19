const express = require("express");

const router = express.Router();

import { verifyToken } from "../../modules/auth/authMiddleware";
import invitationActions from "../../modules/invitation/invitationActions";
import invitationServices from "../../modules/invitation/invitationServices";

router.get(
  "/:id",
  invitationServices.checkExpirationDate,
  invitationActions.read,
);

router.use(verifyToken);

router.patch("/:id", invitationActions.edit);

router.delete("/:tripId/:userId", invitationActions.deleteInvitation);

export default router;
