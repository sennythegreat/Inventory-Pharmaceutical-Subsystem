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
    const body = await request.json();

    if (body.isFullEdit) {
      // Full edit mode
      const { name, dosage, price, expiry } = body;
      
      const { data, error } = await supabase
        .from("medications")
        .update({
          name,
          dosage,
          price: Number.parseFloat(price),
          expiry
        })
        .eq("id", id)
        .select();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data[0]);
    }

    const { quantityToAdd, price, expiry } = body;

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
    if (expiry) updatePayload.expiry = expiry;

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

export async function DELETE(request, context) {
  const auth = requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const supabase = createClient();

    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Medication deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
