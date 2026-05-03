import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth"; //updated import path
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/client";

export async function GET(request) {
  //Authentication
  const guard = withAuth(request);
  if (guard) return guard; //returns 401 JSON if token missing/invalid

  //Get user info from the token (for logging / metadata)
  const { payload } = requireAuth(request);
  console.log(
    `[GET /api/inventory] user=${payload.username} role=${payload.role}`,
  );

  //Fetch data from Supabase
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data,
      meta: {
        total: data?.length || 0,
        fetchedBy: payload.username,
        role: payload.role,
      },
    },
    { status: 200 },
  );
}

export async function POST(request) {
  //Authentication
  const guard = withAuth(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const supabase = createClient();

    if (
      !body.proprietaryName ||
      !body.dosage ||
      !body.quantity ||
      !body.price ||
      !body.expiry
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const randomId = `MED-${Math.floor(Math.random() * 900000) + 100000}`;

    const { data, error } = await supabase
      .from("medications")
      .insert([
        {
          id: randomId,
          name: body.proprietaryName,
          dosage: body.dosage,
          quantity: parseInt(body.quantity, 10) || 0,
          price: parseFloat(body.price) || 0,
          expiry: body.expiry,
          status: "SUFFICIENT",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/inventory error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
