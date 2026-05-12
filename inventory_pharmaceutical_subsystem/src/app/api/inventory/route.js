import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/client";
import { computeStatus } from "@/app/api/inventory/[id]/route";

export async function GET(request) {
  const guard = withAuth(request);
  if (guard) return guard;

  const { payload } = requireAuth(request);
  console.log(
    `[GET /api/inventory] user=${payload.username} role=${payload.role}`,
  );

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

    //Sequential ID generation
    const { data: countData } = await supabase
      .from("medications")
      .select("id", { count: "exact", head: true });

    const count = (countData?.length || 0) + 6;
    const sequentialId = `MED${String(count).padStart(4, "0")}`;

    const quantity = parseInt(body.quantity, 10) || 0;
    const expiry = body.expiry;

    //computeStatus will determine if the medicine is "In Stock", "Low Stock", or "Expired"
    const status = computeStatus(quantity, expiry);

    const { data, error } = await supabase
      .from("medications")
      .insert([
        {
          id: sequentialId,
          name: body.proprietaryName,
          dosage: body.dosage,
          quantity,
          price: parseFloat(body.price) || 0,
          expiry,
          status,
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
