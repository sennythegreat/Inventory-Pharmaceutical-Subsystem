// POST /api/register
// Body:    { username, password, confirmPassword, fullName, employeeId? }
// Returns: { message, user: { id, username, role } }
// Role is ALWAYS set to "Pharmacist" — this endpoint cannot create other roles. ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { username, password, confirmPassword, fullName, employeeId } =
      await request.json();

    // ── Validate required fields ───────────────────────────────────────────
    if (!username || !password || !confirmPassword || !fullName) {
      return NextResponse.json(
        {
          error:
            "Username, password, confirm password, and full name are required.",
        },
        { status: 400 },
      );
    }

    //Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    //Validate passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }

    //Validate username
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          error: "Username can only contain letters, numbers, and underscores.",
        },
        { status: 400 },
      );
    }

    //Check if username is taken
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another." },
        { status: 409 }, // 409 Conflict
      );
    }

    //Hash password
    const password_hash = await bcrypt.hash(password, 10);

    //Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          username,
          password_hash,
          role: "Pharmacist", //always Pharmacist
          full_name: fullName,
          employee_id: employeeId || null,
        },
      ])
      .select("id, username, role, full_name, employee_id")
      .single();

    if (insertError) {
      console.error("[POST /api/register] Supabase error:", insertError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully. You can now log in.",
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/register]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
