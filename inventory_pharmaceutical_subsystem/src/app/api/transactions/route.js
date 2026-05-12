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
      .order("transaction_date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group transactions by transaction_id (which is unique per invoice/session)
    const groupedTransactions = transactions.reduce((acc, current) => {
      const existing = acc.find(item => item.transaction_id === current.transaction_id);
      
      const medicationDetail = {
        medication_id: current.medication_id,
        quantity: current.quantity,
        name: current.medications?.name,
        dosage: current.medications?.dosage
      };

      if (existing) {
        existing.items.push(medicationDetail);
      } else {
        acc.push({
          transaction_id: current.transaction_id,
          reference_id: current.reference_id,
          patient_name: current.patient_name, // Assuming this exists or is part of data
          performed_by: current.performed_by,
          transaction_date: current.transaction_date,
          items: [medicationDetail]
        });
      }
      return acc;
    }, []);

    return NextResponse.json({ data: groupedTransactions }, { status: 200 });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
