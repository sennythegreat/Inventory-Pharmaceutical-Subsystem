"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { 
  History, 
  Loader2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  User,
  Calendar,
  Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetchWithAuth("/api/transactions");
        const result = await response.json();
        setTransactions(result.data || []);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
    tx.medication_id?.toLowerCase().includes(search.toLowerCase()) ||
    tx.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
    tx.medications?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col gap-6 bg-slate-50/30 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Transaction Logs
          </h1>
          <p className="text-muted-foreground">Audit trail for all inventory movements and dispensing actions.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID, medication, or user..."
          className="pl-10 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="mt-4 text-muted-foreground">Fetching audit logs...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-20 flex flex-col items-center flex-1">
             <History className="h-12 w-12 text-slate-200 mb-4" />
             <h3 className="text-lg font-medium text-slate-900">No records found</h3>
             <p className="text-muted-foreground mt-1">Wait for transactions to be processed or adjust your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTransactions.map((tx) => (
              <Card key={tx._id || tx.id} className="group hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    {/* Icon/Type */}
                    <div className={`p-2 rounded-full ${
                      tx.type === 'DISPENSE' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {tx.type === 'DISPENSE' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>

                    {/* Medication Info */}
                    <div className="flex flex-col min-w-[200px]">
                      <h4 className="font-bold text-slate-900 leading-tight">
                        {tx.medications?.name || tx.medication_id}
                      </h4>
                      <p className="text-xs text-muted-foreground uppercase flex items-center gap-1 mt-1">
                        <Package className="h-3 w-3" />
                        Qty: {tx.quantity} {tx.medications?.dosage}
                      </p>
                    </div>

                    {/* Reference and Identity */}
                    <div className="hidden md:flex flex-col min-w-[150px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Reference</p>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                        {tx.reference_id || 'N/A'}
                      </p>
                    </div>

                    <div className="hidden lg:flex flex-col min-w-[150px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Performed By</p>
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-1 capitalize">
                        <User className="h-3 w-3" />
                        {tx.performed_by}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 capitalize">
                      {tx.type?.toLowerCase()}
                    </Badge>
                  </div>

                  {/* Time/Date */}
                  <div className="flex flex-col items-end min-w-[120px]">
                    <div className="flex items-center gap-1 text-slate-900 font-bold">
                       <Calendar className="h-3 w-3" />
                       {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
