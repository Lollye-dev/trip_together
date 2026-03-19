import argon2 from "argon2";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return argon2.verify(hashedPassword, plainPassword);
};

export const generateToken = (userId: number): string => {
  return jwt.sign(
    { sub: userId.toString() },
    process.env.APP_SECRET as string,
    { expiresIn: "3h" },
  );
};

export const hashPassword: RequestHandler = async (req, _res, next) => {
  try {
    const { password, ...otherBodyProps } = req.body;

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19 * 1024,
      timeCost: 2,
      parallelism: 1,
    });

    req.body = {
      ...otherBodyProps,
      hashed_password: hashedPassword,
    };

    next();
  } catch (err) {
    next(err);
  }
};
