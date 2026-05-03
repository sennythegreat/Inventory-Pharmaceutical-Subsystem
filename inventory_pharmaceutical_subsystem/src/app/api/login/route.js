import { NextResponse } from "next/server";
import { signToken, verifyCredentials } from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    //Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    //Check credentials against Supabase users table
    const auth = await verifyCredentials(username, password);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { user } = auth;

    //Sign the JWT
    const token = signToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    //Return token in body
    const response = NextResponse.json(
      {
        token,
        user: { id: user.id, username: user.username, role: user.role },
      },
      { status: 200 },
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, //8 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[POST /api/login]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
