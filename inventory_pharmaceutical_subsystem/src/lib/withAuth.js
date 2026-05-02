import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

//Returns null- auth passed
//Returns Response- auth failed, return 401

export function withAuth(request) {
  const auth = requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return null;
}
