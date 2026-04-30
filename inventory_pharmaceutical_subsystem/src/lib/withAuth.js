// src/lib/withAuth.js
// ─────────────────────────────────────────────────────────────────────────────
// A small helper used directly inside App Router route handlers.
// Keeps route handler code clean — just call withAuth(request) at the top.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Call at the top of any App Router route handler.
 *
 * Returns null  → auth passed, continue with your logic.
 * Returns Response → auth failed, return this 401 immediately.
 *
 * Usage:
 *   const guard = withAuth(request);
 *   if (guard) return guard;
 */
export function withAuth(request) {
  const auth = requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return null;
}
