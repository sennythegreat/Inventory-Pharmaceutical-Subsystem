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
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("medications")
      .insert([
        {
          id: `MED-${Math.floor(Math.random() * 900000) + 100000}`, // Generate a random ID starting with MED-
          name: body.proprietaryName,
          dosage: body.dosage, 
          quantity: Number.parseInt(body.quantity) || 0, 
          price: Number.parseFloat(body.price) || 0,
          expiry: body.expiry, 
          status: "In Stock", 
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}