"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Calendar, User, CreditCard, Package } from "lucide-react";

export default function InvoiceDetails({ invoice }) {
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 bg-slate-50/30">
        <Package className="h-12 w-12 mb-4 opacity-20" />
        <p>Select an invoice from the list to view details</p>
      </div>
    );
  }

  const items = invoice.items || [];

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'paid') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Details</h1>
          <p className="text-muted-foreground">Detailed view for external invoice</p>
        </div>
        <Badge variant="outline" className={`px-3 py-1 capitalize font-semibold shadow-sm ${getStatusStyles(invoice.status)}`}>
          {invoice.status || 'Paid'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium leading-none mb-1">Patient Information</p>
              <p className="text-lg font-semibold">{invoice.patient_name}</p>
              {invoice.patient_id && <p className="text-xs text-muted-foreground">ID: {invoice.patient_id}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium leading-none mb-1">Billing Date</p>
              <p className="text-lg font-semibold">{new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">{new Date(invoice.invoice_date || invoice.created_at).toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> Items Purchased
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Medicine</th>
                  <th className="text-center p-3 font-medium">Quantity</th>
                  <th className="text-right p-3 font-medium">Unit Price</th>
                  <th className="text-right p-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length > 0 ? items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3">
                      <p className="font-medium">{item.medicineName}</p>
                      {item.prescribedDosage && <p className="text-xs text-muted-foreground">{item.prescribedDosage}</p>}
                    </td>
                    <td className="p-3 text-center">{item.prescribedQuantity}</td>
                    <td className="p-3 text-right">${item.unitPrice?.toFixed(2)}</td>
                    <td className="p-3 text-right font-medium">${item.totalPrice?.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-muted-foreground italic">No medicines listed in this invoice</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td colSpan="3" className="p-3 text-right">Total Amount</td>
                  <td className="p-3 text-right text-lg text-primary">
                    ${(invoice.total_amount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
