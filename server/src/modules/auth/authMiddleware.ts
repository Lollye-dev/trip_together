import type { Request, RequestHandler } from "express";
import jwt, {
  JsonWebTokenError,
  TokenExpiredError,
  type JwtPayload,
} from "jsonwebtoken";

interface MyPayload extends JwtPayload {
  sub: string;
}

type RequestWithAuth = Request & {
  auth: MyPayload;
};

export const verifyToken: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(
      token,
      process.env.APP_SECRET as string,
    ) as MyPayload;

    (req as RequestWithAuth).auth = decoded;

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(401).json({ error: "Unauthorized" });
  }
};
