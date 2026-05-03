"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "../ui/input.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { externalInventoryService } from "@/services/externalInventoryServices";

export default function InvoiceSidebar({ onSelectInvoice, selectedId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      try {
        const response = await externalInventoryService.getAllInvoices();
        // The data is now nested: { status: "success", data: { invoices: [...] } }
        setInvoices(response.data?.invoices || []);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_id?.toString().toLowerCase().includes(search.toLowerCase()) ||
    inv.patient_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r bg-slate-50/50">
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold mb-4 text-lg">External Invoices</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-4">No invoices found.</p>
        ) : (
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={invoice._id || invoice.invoice_id}
                className={`cursor-pointer transition-colors hover:bg-slate-100 ${selectedId === (invoice._id || invoice.invoice_id) ? 'border-primary ring-1 ring-primary bg-slate-100' : ''}`}
                onClick={() => onSelectInvoice(invoice)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{invoice.patient_name || 'Unknown Patient'}</p>
                      
                    </div>
                    <p className="text-xs font-semibold">
                      ${invoice.total_amount || 0}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(invoice.created_at || invoice.invoice_date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
