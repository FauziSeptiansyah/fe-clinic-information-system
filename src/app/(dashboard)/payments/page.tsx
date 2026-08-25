"use client";

import * as React from "react";
import { billingService, paymentService, visitService } from "@/services";
import { Invoice, Payment, PaymentMethod, Visit } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Printer } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function PaymentsPage() {
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = React.useState<number>(0);
  const [payMethod, setPayMethod] = React.useState<PaymentMethod>("CASH");
  const [refNumber, setRefNumber] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [receiptData, setReceiptData] = React.useState<Payment | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [pays, invs, vs] = await Promise.all([
        paymentService.getAll(),
        billingService.getAll(),
        visitService.getAll(),
      ]);
      setPayments(pays);
      setInvoices(invs);
      setVisits(vs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.remainingAmount);
    setPayMethod(inv.payerType === "BPJS" ? "BPJS" : "QRIS");
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (payAmount <= 0) {
      toast.error("Nominal pembayaran harus lebih dari 0.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await paymentService.create({
        invoiceId: selectedInvoice.id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNumber: refNumber || (payMethod === "QRIS" ? "QRIS-" + Date.now().toString().slice(-6) : undefined),
        cashierName: user?.name || "Kasir",
      });

      toast.success(`Pembayaran sebesar ${formatCurrency(payAmount)} berhasil diproses!`);
      setSelectedInvoice(null);
      setReceiptData(res.payment);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memproses pembayaran.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Only invoices whose visit has actually reached the cashier stage — a visit still
  // mid-pipeline (with nurse follow-up, or waiting for the pharmacy) isn't payable yet.
  const visitsWaitingCashier = new Set(visits.filter((v) => v.status === "WAITING_CASHIER").map((v) => v.id));
  const unpaidInvoices = invoices.filter(
    (i) => (i.status === "UNPAID" || i.status === "PARTIAL") && i.visitId && visitsWaitingCashier.has(i.visitId)
  );

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "paymentNumber",
      header: "No. Bukti Bayar",
      cell: ({ row }) => <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{row.getValue("paymentNumber")}</span>,
    },
    {
      accessorKey: "invoiceNumber",
      header: "No. Invoice",
      cell: ({ row }) => <span className="font-mono text-xs text-slate-700">{row.getValue("invoiceNumber")}</span>,
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("patientName")}</span>,
    },
    {
      accessorKey: "amount",
      header: "Nominal Diterima",
      cell: ({ row }) => <span className="font-bold text-xs text-emerald-700">{formatCurrency(row.getValue("amount"))}</span>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Metode Bayar",
      cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.getValue("paymentMethod")}</Badge>,
    },
    {
      accessorKey: "paidAt",
      header: "Waktu Bayar",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDateTime(row.getValue("paidAt"))}</span>,
    },
    {
      id: "actions",
      header: "Struk",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setReceiptData(row.original)} className="h-8 text-xs">
          <Printer className="h-3.5 w-3.5 mr-1" />
          Cetak Struk (80mm)
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Kasir & Pembayaran Tagihan"
        description="Penerimaan pembayaran kasir klinik via Tunai, Debit EDC, QRIS, Transfer Bank, BPJS & Asuransi."
      />

      {unpaidInvoices.length > 0 && (
        <Card className="shadow-xs border-amber-200 bg-amber-50/20">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-600" />
                Tagihan Belum Lunas ({unpaidInvoices.length} Pasien)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {unpaidInvoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-white rounded border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{inv.patientName}</p>
                    <p className="text-[11px] text-slate-500">{inv.invoiceNumber} • Sisa: <strong className="text-red-600">{formatCurrency(inv.remainingAmount)}</strong></p>
                  </div>
                  <Button size="sm" onClick={() => handleOpenPay(inv)} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    Bayar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={payments}
        searchKey="patientName"
        searchPlaceholder="Cari riwayat pembayaran pasien..."
        isLoading={isLoading}
      />

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Proses Pembayaran Kasir
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tagihan {selectedInvoice?.invoiceNumber} • Pasien: {selectedInvoice?.patientName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProcessPayment} className="space-y-4 my-2">
            <div className="p-3 rounded bg-slate-50 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Tagihan:</span>
                <span className="font-semibold">{formatCurrency(selectedInvoice?.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm">
                <span>Sisa Harus Dibayar:</span>
                <span className="text-red-600">{formatCurrency(selectedInvoice?.remainingAmount)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Metode Pembayaran</Label>
              <Select value={payMethod} onValueChange={(val) => setPayMethod(val as PaymentMethod)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                  <SelectItem value="QRIS">QRIS Standar (BCA/Gojek/Shopee/dll)</SelectItem>
                  <SelectItem value="DEBIT">Kartu Debit / EDC</SelectItem>
                  <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                  <SelectItem value="BPJS">Klaim BPJS Kesehatan</SelectItem>
                  <SelectItem value="INSURANCE">Klaim Asuransi Swasta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Nominal Pembayaran (Rp) *</Label>
              <Input
                type="number"
                min="1"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="text-sm font-bold"
                required
              />
            </div>

            {payMethod !== "CASH" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">No. Referensi / No. Transaksi (Opsional)</Label>
                <Input
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="Cth: REF-88192039 / No approval EDC"
                  className="text-xs"
                />
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>Batal</Button>
              <Button type="submit" size="sm" disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs">
                {isProcessing ? "Memproses..." : "Terima Pembayaran & Cetak Struk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
        <DialogContent className="max-w-sm p-6 text-center">
          <div className="thermal-receipt space-y-3">
            <div className="text-center border-b border-slate-400 pb-2">
              <h3 className="font-bold text-sm">KLINIK SEHAT PRATAMA</h3>
              <p className="text-[10px] text-slate-500">Jl. Kesehatan Medika No. 88, Jakarta Selatan</p>
              <p className="text-[10px] text-slate-500">Telp: 021-78901234</p>
            </div>

            <div className="text-left text-xs space-y-1 py-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Bukti:</span>
                <span className="font-mono font-semibold">{receiptData?.paymentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Invoice:</span>
                <span className="font-mono">{receiptData?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pasien:</span>
                <span className="font-semibold">{receiptData?.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTime(receiptData?.paidAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-semibold">{receiptData?.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-b border-slate-300 py-2 text-xs space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL DITERIMA:</span>
                <span>{formatCurrency(receiptData?.amount)}</span>
              </div>
              {receiptData && receiptData.change > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(receiptData?.change)}</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 italic text-center pt-1">
              *** LUNAS — Terima kasih atas kunjungan Anda ***
            </p>
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()} className="w-full text-xs">
              <Printer className="h-3.5 w-3.5 mr-1" />
              Cetak Struk Thermal (80mm)
            </Button>
            <Button type="button" size="sm" onClick={() => setReceiptData(null)} className="w-full text-xs">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
