import { createClient } from "../../../../lib/client";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth";

export async function PATCH(request, context) {
  //Auth guard
  const auth = requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const supabase = createClient();
    const { quantityToAdd, price, expiry } = await request.json();

    //1. Get current stock
    const { data: currentData, error: fetchError } = await supabase
      .from("medications")
      .select("quantity")
      .eq("id", id);

    if (fetchError || !currentData || currentData.length === 0) {
      return NextResponse.json(
        { error: fetchError?.message || "Medication not found" },
        { status: 404 },
      );
    }

    const medRecord = currentData[0];
    const newStock = (medRecord.quantity || 0) + Number.parseInt(quantityToAdd);

    //2. Prepare update data
    const updatePayload = {
      quantity: newStock,
      status: newStock > 5 ? "IN STOCK" : newStock > 0 ? "LOW" : "OUT OF STOCK",
    };

    if (price) updatePayload.price = Number(price);
    if (expiry) updatePayload.expiry_date = expiry;

    //3. Update stock
    const { data: updatedData, error: updateError } = await supabase
      .from("medications")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedData[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
