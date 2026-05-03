import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";

/**
 * Proxy route to handle external invoice data
 */
export async function GET(request) {
  const guard = withAuth(request);
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoiceId");

  try {
    const apiKey = process.env.NEXT_PUBLIC_EXTERNAL_PMS_API_KEY;
    const baseUrl = "https://pms-backend-kohl.vercel.app/api/v1/external/invoices";
    
    // Construct the URL based on whether an invoiceId is provided
    let url = baseUrl;
    if (invoiceId) {
      // Assuming the external API might support something like ?invoiceId=ID 
      // or if it returns all, we filter. If the external API has a specific endpoint for single, use that.
      url = `${baseUrl}?invoiceId=${invoiceId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { status: "error", message: errorData.message || "External API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("External API Fetch Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
