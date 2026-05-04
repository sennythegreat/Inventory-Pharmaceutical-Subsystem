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
    const { invoiceId, items } = await request.json();

    if (!invoiceId || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing invoice details or items" },
        { status: 400 }
      );
    }

    // 1. Mark invoice/prescription as dispensed in our local tracking
    // Note: We might want to save the external invoice_id as a reference
    const { error: updateError } = await supabase
      .from("dispensed_history") // Assuming a table for history
      .insert({ 
        external_invoice_id: invoiceId, 
        dispensed_at: new Date().toISOString(), 
        dispensed_by: payload.username 
      });

    if (updateError) {
        // If table doesn't exist, we log but continue with inventory decrement
        console.warn("Could not log to dispensed_history:", updateError.message);
    }

    // Update external invoice release status
    try {
      const apiKey = process.env.NEXT_PUBLIC_EXTERNAL_PMS_API_KEY;
      await fetch(`https://pms-backend-kohl.vercel.app/api/v1/external/invoices/${invoiceId}/release`, {
        method: 'PATCH',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_released: true })
      });
    } catch (err) {
      console.error("Failed to update external invoice status:", err);
    }

    // 2. Reduce stock for each item and log transaction
    for (const item of items) {
       // Get current quantity
       const { data: currentMed, error: fetchError } = await supabase
         .from("medications")
         .select("quantity")
         .eq("id", item.medication_id)
         .single();

       if (fetchError || !currentMed) {
         console.error(`Could not find medication ${item.medication_id}:`, fetchError);
         continue;
       }

       const newQuantity = (currentMed.quantity || 0) - item.quantity;

       // Update medication quantity manually (fallback if RPC missing)
       const { error: stockError } = await supabase
         .from("medications")
         .update({ quantity: newQuantity })
         .eq("id", item.medication_id);
       
       if (stockError) {
           console.error(`Stock update failed for ${item.medication_id}:`, stockError);
       }

       // Insert into transactions table
       await supabase.from("transactions").insert({
          type: "DISPENSE",
          medication_id: item.medication_id,
          quantity: item.quantity,
          performed_by: payload.username,
          reference_id: invoiceId
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
