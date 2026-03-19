import type { RequestHandler } from "express";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";
import invitationRepository from "./invitationRepository";

type RequestWithAuth = import("express").Request & {
  auth: {
    sub: string;
  };
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);

    if (Number.isNaN(invitationId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const invitation = await invitationRepository.select(invitationId);

    if (!invitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    if (invitation.status === "accepted") {
      res.status(409).json({
        message: "Invitation déjà acceptée",
        trip_id: invitation.trip_id,
      });
      return;
    }

    if (invitation.status === "refused") {
      res.status(410).json({
        message: "Invitation déjà refusée",
      });
      return;
    }

    res.json(invitation);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);
    const updateInvitation = await invitationRepository.select(invitationId);

    if (Number.isNaN(invitationId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    if (!updateInvitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    const success = await invitationRepository.updateStatus(
      invitationId,
      req.body.status,
    );

    if (!success) {
      res.status(500).json({ error: "Erreur mise à jour" });
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID du voyage invalide" });
      return;
    }

    const { email, message } = req.body;
    if (!email || !message) {
      res.status(400).json({ error: "Email et message requis" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Format email invalide" });
      return;
    }

    const existingUser = await userRepository.findByEmail(email);
    if (!existingUser) {
      res
        .status(404)
        .json({ error: "Aucun compte utilisateur trouvé avec cet email" });
      return;
    }

    const existingInvitation = await invitationRepository.findByEmailAndTrip(
      email,
      tripId,
    );
    if (existingInvitation) {
      res
        .status(409)
        .json({ error: "Cet utilisateur a déjà été invité à ce voyage" });
      return;
    }

    const invitationId = await invitationRepository.create(
      tripId,
      email,
      message,
      existingUser.id,
    );

    const invitationLink = `${process.env.CLIENT_URL}/trip/${tripId}/invitation/${invitationId}`;

    res.status(201).json({ invitationLink });
  } catch (err) {
    next(err);
  }
};

const browseInvitations: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID de voyage invalide" });
      return;
    }

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      res.status(404).json({ error: "Voyage introuvable" });
      return;
    }

    const invitations = await invitationRepository.selectByTrip(tripId);

    res.json({
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        start_at: trip.start_at,
        end_at: trip.end_at,
        user_id: trip.user_id,
        owner_firstname: trip.owner_firstname,
        owner_lastname: trip.owner_lastname,
        image_url: trip.image_url,
      },
      invitations,
    });
  } catch (err) {
    next(err);
  }
};

const deleteInvitation: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    const userId = Number(req.params.userId);
    const authReq = req as unknown as RequestWithAuth;
    const currentUserId = Number(authReq.auth.sub);

    if (Number.isNaN(tripId) || Number.isNaN(userId)) {
      res.status(400).json({ message: "Paramètres invalides" });
      return;
    }

    const isOwner = await tripRepository.isOwner(tripId, currentUserId);
    if (!isOwner) {
      res.status(403).json({
        error: "Seul le créateur du voyage peut retirer un membre",
      });
      return;
    }

    const success = await invitationRepository.deleteInvitation(tripId, userId);

    if (!success) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { edit, read, add, browseInvitations, deleteInvitation };
