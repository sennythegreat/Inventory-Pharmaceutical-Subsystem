// Central auth utility.
// Uses jsonwebtoken + a JWT_SECRET stored in .env

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add JWT_SECRET=... to .env.local");
}

//Demo users
//Replace with a real DB lookup + bcrypt.compare() in production.
//Passwords are plain-text here for demo only.
export const VALID_USERS = [
  {
    id: "S0001",
    username: "admin",
    password: "password123",
    role: "Full Access",
  },
  { id: "S0002", username: "staff", password: "staff456", role: "Read Only" },
];

//Token helpers

/** Create a signed JWT that expires in 8 hours. */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

/** Verify a JWT string. Throws on invalid/expired token. */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract + verify the Bearer token from a Next.js App Router Request object.
 *
 * Returns one of:
 *   { ok: true,  payload: { sub, username, role, iat, exp } }
 *   { ok: false, error: string, status: 401 }
 */
export function requireAuth(request) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      error:
        "Missing or malformed Authorization header. Expected: Bearer <token>",
      status: 401,
    };
  }

  const token = authHeader.slice(7); //strip "Bearer "

  try {
    const payload = verifyToken(token);
    return { ok: true, payload };
  } catch (err) {
    return {
      ok: false,
      error:
        err.name === "TokenExpiredError"
          ? "Token has expired — please log in again"
          : "Invalid token",
      status: 401,
    };
  }
}
