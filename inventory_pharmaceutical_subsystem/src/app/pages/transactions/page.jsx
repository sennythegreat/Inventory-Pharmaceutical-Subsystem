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
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { externalInventoryService } from "@/services/externalInventoryServices";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Receipt states
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function loadTransactions() {
      try {
        // Fetch external invoices with a high limit to ensure we see many records
        const response = await fetchWithAuth("/api/dispense/external?limit=1000");
        const result = await response.json();
        
        // Filter to show ONLY released prescriptions (is_released: true)
        const releasedInvoices = (result.data?.invoices || []).filter(inv => inv.is_released === true);
        
        // Sort by released date descending
        releasedInvoices.sort((a, b) => new Date(b.released_at || b.updated_at) - new Date(a.released_at || a.updated_at));
        
        setTransactions(releasedInvoices);
      } catch (err) {
        console.error("Failed to load released prescriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const handleOpenDetail = (tx) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleViewReceipt = async () => {
    if (!selectedTransaction) return;
    setLoadingReceipts(true);
    setIsReceiptModalOpen(true);
    try {
      const response = await externalInventoryService.getReceiptsByInvoiceId(selectedTransaction.invoice_id);
      
      if (response.status === "error") {
        console.error("Receipt error:", response);
        setReceipts([]);
        return;
      }

      const data = response.data?.receipts || (response.data ? [response.data] : []);
      setReceipts(data);
    } catch (err) {
      console.error("Failed to load receipts:", err);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.invoice_id?.toString().toLowerCase().includes(search.toLowerCase()) ||
    tx.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    tx.items?.some(item => item.medicineName?.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination Logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col gap-6 bg-slate-50/30 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Dispensed Prescription Logs
          </h1>
          <p className="text-muted-foreground">Historical records of prescriptions released to patients.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Invoice ID or Patient Name..."
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
            <p className="mt-4 text-muted-foreground">Fetching release history...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-20 flex flex-col items-center flex-1">
             <History className="h-12 w-12 text-slate-200 mb-4" />
             <h3 className="text-lg font-medium text-slate-900">No released records</h3>
             <p className="text-muted-foreground mt-1">Dispensed prescriptions with "Released" status will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedTransactions.map((tx) => (
              <Card 
                key={tx.invoice_id} 
                className="group hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => handleOpenDetail(tx)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    {/* Icon/Type */}
                    <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    {/* Patient Info */}
                    <div className="flex flex-col min-w-[200px]">
                      <h4 className="font-bold text-slate-900 leading-tight">
                        {tx.patient_name}
                      </h4>
                      <p className="text-xs text-muted-foreground uppercase flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        ID: {tx.invoice_id}
                      </p>
                    </div>

                    {/* Items Summary */}
                    <div className="hidden md:flex flex-col min-w-[150px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Items</p>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                        {tx.items?.length || 0} Medications
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 capitalize">
                      Released
                    </Badge>
                  </div>

                  {/* Time/Date */}
                  <div className="flex flex-col items-end min-w-[120px]">
                    <div className="flex items-center gap-1 text-slate-900 font-bold">
                       <Calendar className="h-3 w-3" />
                       {new Date(tx.released_at || tx.invoice_date).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{tx.invoice_id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm shrink-0">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Prescription Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    RELEASED
                  </Badge>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Invoice ID</p>
                  <p className="text-sm font-mono font-medium">{selectedTransaction.invoice_id}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Patient Name</p>
                  <p className="text-base font-bold text-slate-900">{selectedTransaction.patient_name}</p>
                </div>
                
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Medications Dispensed</p>
                  <div className="space-y-2">
                    {selectedTransaction.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">{item.medicineName}</span>
                        <span className="text-slate-500">Qty: {item.prescribedQuantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dispensed Date</p>
                  <p className="font-semibold text-slate-700">
                    {new Date(selectedTransaction.released_at || selectedTransaction.invoice_date).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleViewReceipt}
                >
                  <Receipt className="h-4 w-4" />
                  View Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Receipt className="h-5 w-5 text-primary" />
              Receipt Verification
            </DialogTitle>
            <DialogDescription>
              Verify the official receipt from the billing subsystem.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <ReceiptView receipts={receipts} loading={loadingReceipts} />
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end">
            <Button onClick={() => setIsReceiptModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceiptView({ receipts, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Fetching receipt details...</p>
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-50 rounded-lg border border-dashed">
        <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">No receipts found for this invoice.</p>
        <p className="text-sm text-slate-400 mt-1">Payment may not have been processed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {receipts.map((receipt, idx) => (
        <div key={idx} className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center text-xs uppercase tracking-widest font-bold">
            <span>Official Receipt</span>
            <span>{receipt.receipt_id}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Patient</p>
                  <p className="font-bold text-slate-800">{receipt.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Issued Date</p>
                  <p className="font-medium text-slate-800">{new Date(receipt.issued_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Payment Method</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
                    {receipt.payment_method || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Payment Status</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 uppercase text-[10px]">
                    {receipt.status || "Paid"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold text-slate-600">Service/Medicine Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {receipt.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 text-slate-700 font-medium">{item.serviceName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-dashed">
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Amount Paid</p>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  ₱{receipt.amount_paid?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
