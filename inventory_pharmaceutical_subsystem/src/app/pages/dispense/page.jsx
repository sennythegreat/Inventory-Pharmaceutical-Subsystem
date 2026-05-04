"use client";

import { useState, useEffect } from "react";
import { dispenseService } from "@/services/dispenseServices";
import { externalInventoryService } from "@/services/externalInventoryServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import InvoiceDetails from "@/components/dispense/InvoiceDetails";
import { CheckCircle2, Loader2, Search, Filter, SortAsc, SortDesc } from "lucide-react";

export default function DispensePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // Newest first by default
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      try {
        const response = await externalInventoryService.getAllInvoices();
        setInvoices(response.data?.invoices || []);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const handleOpenInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDispense = async () => {
    if (!selectedInvoice) return;

    setIsDispensing(true);
    try {
      const dispenseData = {
        invoiceId: selectedInvoice.invoice_id,
        patientName: selectedInvoice.patient_name,
        items: selectedInvoice.items.map(item => ({
          medication_id: item.medicineId,
          name: item.medicineName,
          quantity: item.prescribedQuantity
        }))
      };

      await dispenseService.dispenseMedication(dispenseData);
      alert("Medication dispensed successfully!");
      
      setInvoices(invoices.filter(inv => inv.invoice_id !== selectedInvoice.invoice_id));
      setIsModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Dispense error:", error);
      alert(error.message || "Failed to dispense medication");
    } finally {
      setIsDispensing(false);
    }
  };

  const filteredInvoices = invoices
    .filter(inv => {
      // Only show invoices that are NOT released
      if (inv.is_released === true) return false;

      const matchesSearch = 
        inv.invoice_id?.toString().toLowerCase().includes(search.toLowerCase()) ||
        inv.patient_name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || inv.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.invoice_date);
      const dateB = new Date(b.created_at || b.invoice_date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col gap-6 bg-slate-50/30 overflow-hidden">
      {/* Non-scrollable Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">External Invoices</h1>
          <p className="text-muted-foreground">Review and dispense medications from the external subsystem.</p>
        </div>
      </div>

      {/* Non-scrollable Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border shadow-sm shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Patient Name or Invoice ID..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[120px]">
                <Filter className="h-4 w-4" />
                {statusFilter === "all" ? "All Status" : statusFilter}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="flex flex-col gap-1">
                {["all", "paid", "pending", "cancelled"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "secondary" : "ghost"}
                    className="justify-start capitalize font-normal"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="shrink-0"
            title={sortOrder === "asc" ? "Sort Oldest First" : "Sort Newest First"}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4 text-primary" />
            ) : (
              <SortDesc className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="mt-4 text-muted-foreground">Fetching invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white border border-dashed rounded-2xl">
            <CheckCircle2 className="h-12 w-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No invoices found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={invoice._id || invoice.invoice_id}
                className="group hover:border-primary/50 transition-all cursor-pointer hover:shadow-sm"
                onClick={() => handleOpenInvoice(invoice)}
              >
                <CardContent className="p-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex flex-col min-w-[200px]">
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {invoice.patient_name}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase">
                        {invoice.invoice_id?.includes('-') 
                          ? "INV-" + invoice.invoice_id.split('-').pop()
                          : invoice.invoice_id}
                      </p>
                    </div>

                    <div className="hidden md:flex flex-col min-w-[120px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Items</p>
                      <p className="text-sm font-medium">{invoice.items?.length || 0} Products</p>
                    </div>

                    <div className="hidden lg:flex flex-col min-w-[150px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</p>
                      <p className="text-sm font-medium">
                        {new Date(invoice.created_at || invoice.invoice_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col min-w-[100px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                      <div className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 text-center border capitalize ${
                        invoice.status?.toLowerCase() === 'paid' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : invoice.status?.toLowerCase() === 'pending'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : invoice.status?.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {invoice.status?.toLowerCase() || 'paid'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[100px]">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
                    <p className="text-lg font-bold text-slate-900">₱{invoice.total_amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90vw] w-full lg:max-w-7xl p-0 overflow-hidden bg-white border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice Details for {selectedInvoice?.patient_name}</DialogTitle>
            <DialogDescription>
              Viewing detailed items and patient information for external invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {selectedInvoice && (
              <div className="flex flex-col">
                <div className="flex-1">
                  <InvoiceDetails invoice={selectedInvoice} />
                </div>
                
                <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 sticky bottom-0 z-10">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isDispensing}
                  >
                    Close
                  </Button>
                  {selectedInvoice?.status?.toLowerCase() === 'paid' && (
                    <Button 
                      onClick={handleDispense} 
                      disabled={isDispensing}
                      className="gap-2 px-8"
                    >
                      {isDispensing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Confirm Release
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
