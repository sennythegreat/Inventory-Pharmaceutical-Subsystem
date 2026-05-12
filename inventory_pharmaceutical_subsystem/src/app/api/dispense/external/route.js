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
  const isReceiptsRequest = searchParams.get("receipts") === "true";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  try {
    const apiKey = process.env.NEXT_PUBLIC_EXTERNAL_PMS_API_KEY;
    const receiptsApiKey = process.env.NEXT_PUBLIC_EXTERNAL_RECEIPTS_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_PMS_URL || "https://pms-backend-kohl.vercel.app/api/v1/external/invoices";
    const receiptsUrl = process.env.NEXT_PUBLIC_EXTERNAL_RECEIPTS_URL || "https://billing-finance-ashy.vercel.app/api/receipts";
    
    // Construct the URL based on whether an invoiceId is provided
    let url = baseUrl;
    let currentApiKey = apiKey;

    if (isReceiptsRequest) {
      // Use the dedicated billing/finance API for receipts
      url = receiptsUrl;
      currentApiKey = receiptsApiKey;
    } else if (invoiceId) {
      url = `${baseUrl}?invoiceId=${invoiceId}`;
    } else {
      url = `${baseUrl}?page=${page}&limit=${limit}`;
    }

    console.log(`Fetching from external URL: ${url} using key: ${currentApiKey?.substring(0, 5)}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': currentApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`External API Error (${response.status}) for ${url}:`, errorData);
      return NextResponse.json(
        { status: "error", message: errorData.message || "External API error", details: errorData },
        { status: 200 }
      );
    }

    let data = await response.json();

    // If it's a receipts request and we have an invoiceId to filter by
    if (isReceiptsRequest && invoiceId && data.data?.receipts) {
      const filteredReceipts = data.data.receipts.filter(r => r.invoice_id === invoiceId);
      data = {
        ...data,
        data: {
          ...data.data,
          receipts: filteredReceipts
        }
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("External API Fetch Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
