// POST /api/logout
// Clears the HttpOnly auth_token cookie.
// The client cannot delete HttpOnly cookies directly, so we need this endpoint.

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, //expire
    path: "/",
  });

  return response;
}
