import type { Request, RequestHandler } from "express";
import userRepository from "../user/userRepository";
import { generateToken, verifyPassword } from "./authService";

type RequestWithAuth = Request & {
  userId: number;
};

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

export const verify: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as unknown as RequestWithAuth;
    const userId = authReq.userId;
    const user = await userRepository.read(userId);
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const { password, ...userWithoutHashedPassword } = user;
    res.json({ user: userWithoutHashedPassword });
  } catch (err) {
    next(err);
  }
};
