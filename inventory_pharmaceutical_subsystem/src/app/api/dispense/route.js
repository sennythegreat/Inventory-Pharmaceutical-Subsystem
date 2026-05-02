import { createClient } from "../../../../lib/client";
import { NextResponse } from "next/server";

// POST /api/dispense
export async function POST(request) {
  try {
    const supabase = createClient();
    const { medicationId, quantity, patientName, patientId, prescribedBy, notes } =
      await request.json();

    // --- Validation ---
    if (!medicationId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid request: medicationId and a positive quantity are required." },
        { status: 400 }
      );
    }

    // --- 1. Fetch current stock ---
    const { data: medData, error: fetchError } = await supabase
      .from("medications")
      .select("id, name, quantity, price")
      .eq("id", medicationId)
      .single();

    if (fetchError || !medData) {
      return NextResponse.json(
        { error: fetchError?.message || "Medication not found." },
        { status: 404 }
      );
    }

    const currentStock = medData.quantity || 0;

    // --- 2. Check sufficient stock ---
    if (currentStock < quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock. Requested: ${quantity}, Available: ${currentStock}.`,
        },
        { status: 409 }
      );
    }

    const newStock = currentStock - quantity;
    const newStatus =
      newStock > 5 ? "In Stock" : newStock > 0 ? "Low Stock" : "Out of Stock";

    // --- 3. Deduct stock from medications table ---
    const { data: updatedMed, error: updateError } = await supabase
      .from("medications")
      .update({ quantity: newStock, status: newStatus })
      .eq("id", medicationId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // --- 4. Log the transaction ---
    const { data: logEntry, error: logError } = await supabase
      .from("transaction_logs")
      .insert([
        {
          medication_id: medicationId,
          medication_name: medData.name,
          type: "DISPENSE",
          quantity,
          total_price: (medData.price || 0) * quantity,
          patient_name: patientName || null,
          patient_id: patientId || null,
          prescribed_by: prescribedBy || null,
          notes: notes || null,
          dispensed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (logError) {
      // Non-fatal: stock was already updated, just warn
      console.warn("Transaction log failed:", logError.message);
    }

    return NextResponse.json(
      {
        message: "Medication dispensed successfully.",
        updatedMedication: updatedMed,
        transaction: logEntry || null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Dispense route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}