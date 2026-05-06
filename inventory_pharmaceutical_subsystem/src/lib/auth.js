import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add JWT_SECRET=... to .env.local");
}

const EXTERNAL_SAFE_API_KEY = process.env.EXTERNAL_INVENTORY_API_KEY;

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
 * Extract + verify the Bearer token or x-api-key from a Next.js App Router Request object.
 * Returns:
 *   { ok: true,  payload: { sub, username, role, iat, exp } }
 *   { ok: false, error: string, status: 401 }
 */
export function requireAuth(request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const apiKeyHeader = request.headers.get("x-api-key");

  // 1. Check for API Key first
  if (apiKeyHeader === EXTERNAL_SAFE_API_KEY) {
    return {
      ok: true,
      payload: { username: "external_system", role: "external" },
    };
  }

  // 2. Fallback to Bearer Token
  if (authHeader.startsWith("Bearer ")) {
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

  // 3. Unauthorized
  return {
    ok: false,
    error: "Authentication required. Provide a valid 'x-api-key' or 'Authorization: Bearer <token>'",
    status: 401,
  };
}

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

/**
 * Log in via the external subsystem API.
 * 
 * @param {string} username 
 * @param {string} password 
 * @param {string} subsystem 
 */
export async function externalSubsystemLogin(username, password, subsystem = "Inventory") {
  const apiUrl = process.env.AUTH_EXTERNAL_API_URL;
  const subsystemKey = process.env.AUTHENTICATION_API_KEY;

  if (!apiUrl || !subsystemKey) {
    return { ok: false, error: "External authentication is not configured." };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Subsystem-Key": subsystemKey,
      },
      body: JSON.stringify({
        username,
        password,
        subsystem,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.message || data.error || "External login failed." };
    }

    // Return the user data from the external subsystem
    return {
      ok: true,
      user: {
        id: data.user?.id || data.id,
        username: data.user?.username || username,
        role: data.user?.role || "admin",
        token: data.token, // If the external API returns its own token
      },
    };
  } catch (error) {
    console.error("External login error:", error);
    return { ok: false, error: "Authentication service is currently unavailable." };
  }
}
