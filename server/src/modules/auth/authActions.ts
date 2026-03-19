import type { RequestHandler } from "express";
import userRepository from "../user/userRepository";
import { generateToken, verifyPassword } from "./authService";

export const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await userRepository.readByEmail(req.body.email);
    if (!user) {
      res.sendStatus(403);
      return;
    }

    const isValid = await verifyPassword(req.body.password, user.password);

    if (!isValid) {
      return res.sendStatus(401);
    }

    const { password, ...userWithoutHashedPassword } = user;

    const token = generateToken(user.id);

    res.json({ token, user: userWithoutHashedPassword });
  } catch (err) {
    next(err);
  }
};
