import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/client";

/**
 * GET /api/dispense?prescriptionId=...
 * Search for a prescription by ID
 */
export async function GET(request) {
  const guard = withAuth(request);
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const prescriptionId = searchParams.get("prescriptionId");

  if (!prescriptionId) {
    return NextResponse.json(
      { error: "Prescription ID is required" },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Search in prescriptions table
  // Assuming a structure: id, patient_name, doctor_name, status, created_at
  const { data: prescription, error: pError } = await supabase
    .from("prescriptions")
    .select("*, prescription_items(*, medications(*))")
    .eq("id", prescriptionId)
    .single();

  if (pError || !prescription) {
    return NextResponse.json(
      { error: "Prescription not found" }, 
      { status: 404 }
    );
  }

  return NextResponse.json(prescription, { status: 200 });
}

/**
 * POST /api/dispense
 * Process the dispensing logic
 */
export async function POST(request) {
  const guard = withAuth(request);
  if (guard) return guard;

  const { payload } = requireAuth(request);
  const supabase = createClient();

  try {
    const { prescriptionId, items } = await request.json();

    if (!prescriptionId || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing prescription details or items" },
        { status: 400 }
      );
    }

    // 1. Mark prescription as dispensed
    const { error: updateError } = await supabase
      .from("prescriptions")
      .update({ status: "DISPENSED", dispensed_at: new Date().toISOString(), dispensed_by: payload.username })
      .eq("id", prescriptionId);

    if (updateError) throw updateError;

    // 2. Reduce stock for each item and log transaction
    for (const item of items) {
       // Update medication quantity
       const { error: stockError } = await supabase.rpc('decrement_inventory', {
          row_id: item.medication_id,
          amount: item.quantity
       });
       
       if (stockError) throw stockError;

       // Insert into transactions table
       await supabase.from("transactions").insert({
          type: "DISPENSE",
          medication_id: item.medication_id,
          quantity: item.quantity,
          performed_by: payload.username,
          reference_id: prescriptionId
       });
    }

    return NextResponse.json({ success: true, message: "Medication dispensed successfully" });

  } catch (err) {
    console.error("[POST /api/dispense] Error:", err);
    return NextResponse.json(
      { error: err.message || "Dispensing failed" },
      { status: 500 }
    );
  }
}
