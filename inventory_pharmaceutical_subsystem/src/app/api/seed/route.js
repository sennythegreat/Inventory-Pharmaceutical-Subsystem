// GET /api/seed
// Inserts the hardcoded admin and staff users into the Supabase users table
// with properly bcrypt-hashed passwords.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const SEED_USERS = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    username: "admin",
    password: "password123",
    role: "Full Access",
    full_name: "System Administrator",
    employee_id: "S0001",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    username: "staff",
    password: "staff456",
    role: "Read Only",
    full_name: "Staff User",
    employee_id: "S0002",
  },
];

export async function GET() {
  try {
    const results = [];

    for (const u of SEED_USERS) {
      //Hash the plain-text password
      const password_hash = await bcrypt.hash(u.password, 10);

      const { error } = await supabase.from("users").upsert(
        {
          id: u.id,
          username: u.username,
          password_hash,
          role: u.role,
          full_name: u.full_name,
          employee_id: u.employee_id,
        },
        { onConflict: "username", ignoreDuplicates: true },
      );

      results.push({
        username: u.username,
        status: error ? `error: ${error.message}` : "seeded",
      });
    }

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/seed]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
