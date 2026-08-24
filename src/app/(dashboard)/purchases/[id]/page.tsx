"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Purchase } from "@/types";
import { purchaseService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { CurrencyDisplay } from "@/components/common/Displays";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function PurchaseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [po, setPo] = React.useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await purchaseService.getById(id);
        setPo(data);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat faktur pembelian..." /></PageContainer>;
  if (!po) return <PageContainer><ErrorState title="Faktur PO tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <Link href={ROUTES.PURCHASES.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Daftar PO
        </Link>
        <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Faktur (A4)
        </Button>
      </div>

      <div className="a4-document space-y-6">
        <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">FAKTUR PENERIMAAN OBAT (PO)</h1>
            <p className="text-xs text-slate-500">Klinik Pratama Sehat Bersama • Gudang Farmasi</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-blue-700">{po.purchaseNumber}</p>
            <p className="text-xs text-slate-500">{formatDate(po.purchaseDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md">
          <div>
            <p className="text-slate-500">Supplier: <strong className="text-slate-900">{po.supplierName}</strong></p>
            <p className="text-slate-500">Status: <StatusBadge status={po.status} type="purchase" /></p>
          </div>
          <div>
            <p className="text-slate-500">Tgl Pembelian: <strong className="text-slate-900">{formatDate(po.purchaseDate)}</strong></p>
            {po.notes && <p className="text-slate-500">Catatan: {po.notes}</p>}
          </div>
        </div>

        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3 text-left">Nama Obat</th>
                <th className="p-3 text-left">Batch No.</th>
                <th className="p-3 text-left">Tgl Expired</th>
                <th className="p-3 text-right">Jumlah</th>
                <th className="p-3 text-right">Harga Satuan</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-3 font-semibold text-slate-900">{item.medicineName}</td>
                  <td className="p-3 font-mono">{item.batchNumber}</td>
                  <td className="p-3">{item.expiredDate}</td>
                  <td className="p-3 text-right font-bold">{item.quantity} {item.unit}</td>
                  <td className="p-3 text-right"><CurrencyDisplay amount={item.purchasePrice} /></td>
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
              <CurrencyDisplay amount={po.subtotal} />
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PPN:</span>
              <CurrencyDisplay amount={po.tax} />
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-1">
              <span>Total:</span>
              <CurrencyDisplay amount={po.grandTotal} className="text-blue-700" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
