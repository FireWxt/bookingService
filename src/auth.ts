import type { NextFunction, Request, Response } from "express";
import { HOST_TOKEN } from "./config.js";

export function requireHostToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.header("x-host-token") !== HOST_TOKEN) {
    return res.status(401).json({ error: "Missing or invalid host token" });
  }
  next();
}
