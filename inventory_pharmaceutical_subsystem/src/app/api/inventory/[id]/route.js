//computeStatus() to update and recalculate status upon editing/restock
//Status labels: SUFFICIENT, LOW, CRITICAL, EXPIRING SOON, EXPIRED, OUT OF STOCK

import { createClient } from "../../../../lib/client";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth";

/**
 *Compute the medication status from quantity and expiry date.
 *if else like structure for determining status:
 *   OUT OF STOCK =quantity=0
 *   EXPIRED      =expiry date is in the past
 *   EXPIRING SOON=expiry is within the next 15 days
 *   CRITICAL     =quantity 1–10
 *   LOW          =quantity 11–30
 *   SUFFICIENT   =quantity 31+
 */
export function computeStatus(quantity, expiry) {
  const qty = Number(quantity) || 0;

  if (qty === 0) return "OUT OF STOCK";

  if (expiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiry);
    expiryDate.setHours(0, 0, 0, 0);
    const daysLeft = (expiryDate - today) / (1000 * 60 * 60 * 24);

    if (daysLeft < 0) return "EXPIRED";
    if (daysLeft <= 15) return "EXPIRING SOON";
  }

  if (qty <= 10) return "CRITICAL";
  if (qty <= 30) return "LOW";
  return "SUFFICIENT";
}

//update
export async function PATCH(request, context) {
  const auth = requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const supabase = createClient();
    const body = await request.json();

    //edit (name, dosage, price, expiry)
    if (body.isFullEdit) {
      const { name, dosage, price, expiry } = body;

      //fetch current quantity to update statius
      const { data: current, error: fetchError } = await supabase
        .from("medications")
        .select("quantity")
        .eq("id", id)
        .single();

      if (fetchError || !current) {
        return NextResponse.json(
          { error: fetchError?.message || "Medication not found" },
          { status: 404 },
        );
      }

      const newStatus = computeStatus(current.quantity, expiry);

      const { data, error } = await supabase
        .from("medications")
        .update({
          name,
          dosage,
          price: Number.parseFloat(price),
          expiry,
          status: newStatus,
        })
        .eq("id", id)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data[0]);
    }

    //Restock (quantityToAdd, price, expiry)
    const { quantityToAdd, price, expiry } = body;

    // 1. Get current quantity and expiry
    const { data: currentData, error: fetchError } = await supabase
      .from("medications")
      .select("quantity, expiry")
      .eq("id", id);

    if (fetchError || !currentData || currentData.length === 0) {
      return NextResponse.json(
        { error: fetchError?.message || "Medication not found" },
        { status: 404 },
      );
    }

    const medRecord = currentData[0];
    const newStock = (medRecord.quantity || 0) + Number.parseInt(quantityToAdd);
    const finalExpiry = expiry || medRecord.expiry;

    // 2. Compute consistent status
    const newStatus = computeStatus(newStock, finalExpiry);

    // 3. Build update payload
    const updatePayload = { quantity: newStock, status: newStatus };
    if (price) updatePayload.price = Number(price);
    if (expiry) updatePayload.expiry = expiry;

    // 4. Save
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
    console.error("PATCH /api/inventory/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

//DELETE
export async function DELETE(request, context) {
  const auth = requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const supabase = createClient();

    const { error } = await supabase.from("medications").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Medication deleted" });
  } catch (err) {
    console.error("DELETE /api/inventory/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
