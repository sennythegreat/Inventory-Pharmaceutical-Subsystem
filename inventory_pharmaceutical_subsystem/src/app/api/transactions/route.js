import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { createClient } from "@/lib/client";

export async function GET(request) {
  const guard = withAuth(request);
  if (guard) return guard;

  const supabase = createClient();

  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        *,
        medications (
          name,
          dosage
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
