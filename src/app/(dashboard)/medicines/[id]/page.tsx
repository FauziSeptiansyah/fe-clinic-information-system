"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Medicine, MedicineBatch } from "@/types";
import { medicineService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DetailCard, DetailRow, CurrencyDisplay } from "@/components/common/Displays";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function MedicineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [medicine, setMedicine] = React.useState<Medicine | null>(null);
  const [batches, setBatches] = React.useState<MedicineBatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [med, bts] = await Promise.all([
          medicineService.getById(id),
          medicineService.getBatches(id),
        ]);
        setMedicine(med);
        setBatches(bts);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat detail obat..." /></PageContainer>;
  if (!medicine) return <PageContainer><ErrorState title="Obat tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Link href={ROUTES.MEDICINES.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Katalog Obat
        </Link>
        <Link href={ROUTES.MEDICINES.EDIT(medicine.id)}>
          <Button size="sm" variant="outline">
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Ubah Data Obat
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard title="Informasi Obat">
          <DetailRow label="Kode Obat" value={<span className="font-mono font-bold text-blue-700">{medicine.code}</span>} />
          <DetailRow label="Nama Obat" value={<strong>{medicine.name}</strong>} />
          <DetailRow label="Nama Generik" value={medicine.genericName} />
          <DetailRow label="Kategori" value={<Badge variant="outline">{medicine.category}</Badge>} />
          <DetailRow label="Satuan" value={medicine.unit} />
          <DetailRow label="Produsen / Pabrik" value={medicine.manufacturer} />
          <DetailRow label="Status" value={<StatusBadge status={medicine.status} />} />
        </DetailCard>

        <DetailCard title="Harga & Total Stok">
          <DetailRow label="Harga Beli" value={<CurrencyDisplay amount={medicine.purchasePrice} />} />
          <DetailRow label="Harga Jual" value={<CurrencyDisplay amount={medicine.sellingPrice} />} />
          <DetailRow label="Total Stok Berjalan" value={<strong className="text-emerald-700 text-base">{medicine.currentStock} {medicine.unit}</strong>} />
          <DetailRow label="Batas Minimum Stok" value={`${medicine.minimumStock} ${medicine.unit}`} />
        </DetailCard>
      </div>

      <DetailCard title="Batch Terdaftar & Masa Kedaluwarsa (FEFO)">
        {batches.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Belum ada batch terdaftar untuk obat ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500 text-left">
                  <th className="pb-2">No. Batch</th>
                  <th className="pb-2">Tgl Masuk</th>
                  <th className="pb-2">Tgl Kedaluwarsa (FEFO)</th>
                  <th className="pb-2">Sisa Stok</th>
                  <th className="pb-2">Status Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2.5 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                    <td className="py-2.5 text-slate-600">{formatDate(b.entryDate)}</td>
                    <td className="py-2.5 font-semibold text-slate-900">{formatDate(b.expiredDate)}</td>
                    <td className="py-2.5 font-mono font-bold text-blue-600">{b.remainingQuantity} {medicine.unit}</td>
                    <td className="py-2.5"><StatusBadge status={b.status} type="batch" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailCard>
    </PageContainer>
  );
}
