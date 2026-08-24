"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Invoice } from "@/types";
import { billingService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/Displays";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, CreditCard } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await billingService.getById(id);
        setInvoice(data);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat lembar tagihan..." /></PageContainer>;
  if (!invoice) return <PageContainer><ErrorState title="Invoice tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <Link href={ROUTES.BILLING.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Billing
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Cetak Invoice (A4)
          </Button>
          {invoice.status !== "PAID" && (
            <Link href={ROUTES.PAYMENTS}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Bayar di Kasir
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="a4-document space-y-6">
        <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">KWITANSI / INVOICE PELAYANAN MEDIS</h1>
            <p className="text-xs text-slate-500">Klinik Pratama Sehat Bersama • Bagian Keuangan</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500">{formatDateTime(invoice.createdAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md">
          <div>
            <p className="text-slate-500">Pasien: <strong className="text-slate-900">{invoice.patientName}</strong></p>
            <p className="text-slate-500">No RM: <span className="font-mono">{invoice.patientMrNumber}</span></p>
          </div>
          <div>
            <p className="text-slate-500">Penjamin: <strong>{invoice.payerType}</strong></p>
            <p className="text-slate-500">Status Pembayaran: <StatusBadge status={invoice.status} type="invoice" /></p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3 text-left">Deskripsi Layanan / Obat</th>
                <th className="p-3 text-center">Jenis</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Harga Satuan</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-3 font-medium text-slate-900">{item.name}</td>
                  <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{item.type}</Badge></td>
                  <td className="p-3 text-right font-mono">{item.quantity}</td>
                  <td className="p-3 text-right"><CurrencyDisplay amount={item.unitPrice} /></td>
                  <td className="p-3 text-right font-bold"><CurrencyDisplay amount={item.subtotal} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <CurrencyDisplay amount={invoice.subtotal} />
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon / Tanggungan BPJS:</span>
                <span>- {formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-1">
              <span>Grand Total:</span>
              <CurrencyDisplay amount={invoice.grandTotal} />
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sudah Dibayar:</span>
              <CurrencyDisplay amount={invoice.paidAmount} />
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
              <span>Sisa Tagihan:</span>
              <span className="text-red-600">{formatCurrency(invoice.remainingAmount)}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-between text-xs text-center border-t border-slate-200">
          <div>
            <p className="text-slate-500 mb-12">Pasien / Keluarga</p>
            <p className="font-bold text-slate-900">( {invoice.patientName} )</p>
          </div>
          <div>
            <p className="text-slate-500 mb-12">Kasir Pembayaran</p>
            <p className="font-bold text-slate-900">( Rina Kusuma )</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
