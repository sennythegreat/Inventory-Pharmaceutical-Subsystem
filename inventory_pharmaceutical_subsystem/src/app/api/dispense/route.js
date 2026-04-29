import { createClient } from "../../../lib/client";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { patientId, items, staffId } = await request.json();

    if (!patientId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Patient ID and at least one medication item are required." },
        { status: 400 }
      );
    }

    // Validate stock for each item before any update
    for (const item of items) {
      const { data: med, error: fetchError } = await supabase
        .from("medications")
        .select("id, name, quantity, price")
        .eq("id", item.medicationId)
        .single();

      if (fetchError || !med) {
        return NextResponse.json(
          { error: `Medication ${item.medicationId} not found.` },
          { status: 404 }
        );
      }

      if (med.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${med.name}. Available: ${med.quantity}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Deduct stock and build transaction lines
    const txnId = `TXN${Date.now()}`;
    let totalAmount = 0;
    const transactionLines = [];

    for (const item of items) {
      const { data: med } = await supabase
        .from("medications")
        .select("id, name, quantity, price, dosage")
        .eq("id", item.medicationId)
        .single();

      const newQty = med.quantity - Number(item.quantity);
      let newStatus = "SUFFICIENT";
      if (newQty === 0) newStatus = "OUT OF STOCK";
      else if (newQty <= 5) newStatus = "LOW";

      await supabase
        .from("medications")
        .update({ quantity: newQty, status: newStatus })
        .eq("id", item.medicationId);

      const subtotal = med.price * Number(item.quantity);
      totalAmount += subtotal;

      transactionLines.push({
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        quantity: Number(item.quantity),
        unitPrice: med.price,
        subtotal,
      });
    }

    // Record transaction
    const { data: txn, error: txnError } = await supabase
      .from("transactions")
      .insert([
        {
          id: txnId,
          patient_id: patientId,
          staff_id: staffId || "S0000",
          items: transactionLines,
          total_amount: totalAmount,
          status: "SUCCESS",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (txnError) {
      // Non-fatal: stock was already deducted, log the error
      console.error("Transaction record failed:", txnError.message);
    }

    return NextResponse.json(
      {
        success: true,
        transactionId: txnId,
        totalAmount,
        items: transactionLines,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}