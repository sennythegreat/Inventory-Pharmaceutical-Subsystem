import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add JWT_SECRET=... to .env.local");
}

//Token helpers (unchanged)
/**JWT expires in 8 hours */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

/**Verify a JWT string*/
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract + verify the Bearer token from a Next.js App Router Request object.
 * Returns:
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

  const token = authHeader.slice(7);

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

//Supabase credential verification
/**
 * Look up a user by username in Supabase and verify their password.
 *
 * Returns:
 *   { ok: true,  user: { id, username, role, full_name, employee_id } }
 *   { ok: false, error: string }
 */
export async function verifyCredentials(username, password) {
  //Find the user row by username
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password_hash, role, full_name, employee_id")
    .eq("username", username)
    .single();

  if (error || !user) {
    return { ok: false, error: "Invalid username or password." };
  }

  //Compare the submitted password against the stored bcrypt hash
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return { ok: false, error: "Invalid username or password." };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      employee_id: user.employee_id,
    },
  };
}
