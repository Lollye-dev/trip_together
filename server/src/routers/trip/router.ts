import express from "express";
import { verifyToken } from "../../modules/auth/authMiddleware";
import invitationActions from "../../modules/invitation/invitationActions";
import invitationServices from "../../modules/invitation/invitationServices";
import stepActions from "../../modules/step/stepActions";
import tripActions from "../../modules/trip/tripActions";

const router = express.Router();

router.get("/count", tripActions.count);
router.get("/info/:id", tripActions.read);

router.get("/countries", tripActions.browse);
router.get("/", tripActions.browse);

router.get("/:id", tripActions.browseMyTrip);

router.get("/:id/invitations", invitationActions.browseInvitations);
router.get(
  "/:tripId/invitation/:id",
  invitationServices.checkExpirationDate,
  invitationActions.read,
);

router.use(verifyToken);

router.get("/:id/members", tripActions.browseMembers);

router.get("/:tripId/steps", stepActions.browseSteps);
router.get("/:tripId/steps/:id/votes", stepActions.browseVotes);

router.post("/:id/invitations", invitationActions.add);

router.post("/", tripActions.add);
router.delete("/:id", tripActions.deleteTrip);

router.patch("/:tripId/invitation/:id", invitationActions.edit);

router.post("/:tripId/steps", stepActions.addStep);

router.delete("/:tripId/steps/:stepId", stepActions.deleteStep);

router.post("/:tripId/steps/:id/votes", stepActions.addVote);

export default router;
