//─────────────────────────────────────────────────────────────────────────────
//POST /api/login
//Body:    { username, password }
//Returns: { token, user: { id, username, role } }
//─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { VALID_USERS, signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    //input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    //look up the user
    //TODO (production): replace with a Supabase DB query + bcrypt.compare()
    const user = VALID_USERS.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      //Same message for wrong username OR wrong password to avoid giving hints to attackers.
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    //Sign the JWT
    const token = signToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    //Set auth_token as an HttpOnly cookie
    //return the token in the body
    const response = NextResponse.json(
      {
        token,
        user: { id: user.id, username: user.username, role: user.role },
      },
      { status: 200 },
    );

    //Cookie-based protection for page routes (read by middleware.js)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, //8 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
