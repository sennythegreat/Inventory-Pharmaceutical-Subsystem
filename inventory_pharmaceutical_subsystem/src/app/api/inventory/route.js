import { createClient } from "../../../lib/client";
import { NextResponse } from "next/server";

// GOLETA FETCH
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DURO ADD

export async function POST(request) {
    
}