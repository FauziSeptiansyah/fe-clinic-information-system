"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Prescription } from "@/types";
import { prescriptionService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Pill } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function PrescriptionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [rx, setRx] = React.useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await prescriptionService.getById(id);
        setRx(data);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat lembar resep..." /></PageContainer>;
  if (!rx) return <PageContainer><ErrorState title="Resep tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <Link href={ROUTES.PRESCRIPTIONS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Daftar Resep
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Cetak Resep (A4)
          </Button>
          <Link href={ROUTES.PHARMACY}>
            <Button size="sm" className="bg-purple-700 hover:bg-purple-800 text-xs font-semibold">
              <Pill className="h-3.5 w-3.5 mr-1.5" />
              Proses di Farmasi
            </Button>
          </Link>
        </div>
      </div>

      <div className="a4-document space-y-6">
        <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">LEMBAR SALINAN RESEP DOKTER</h1>
            <p className="text-xs text-slate-500">Klinik Pratama Sehat Bersama • Instalasi Farmasi</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-purple-700">{rx.prescriptionNumber}</p>
            <p className="text-xs text-slate-500">{formatDateTime(rx.createdAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md">
          <div>
            <p className="text-slate-500">Pasien: <strong className="text-slate-900">{rx.patientName}</strong></p>
            <p className="text-slate-500">No RM: <span className="font-mono">{rx.patientMrNumber}</span></p>
          </div>
          <div>
            <p className="text-slate-500">Dokter: <strong className="text-slate-900">{rx.doctorName}</strong></p>
            <p className="text-slate-500">Poliklinik: {rx.departmentName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-1">Daftar R/ Obat</h3>
          <div className="divide-y divide-slate-200">
            {rx.items.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">R / {item.medicineName}</span>
                  <span className="text-slate-500 ml-2 font-mono">No. {item.quantity} ({item.unit})</span>
                  <p className="text-slate-700 font-semibold mt-1">S : {item.frequency} — {item.instructions}</p>
                  {item.batchNumber && (
                    <p className="text-[11px] text-slate-500">Batch: <span className="font-mono">{item.batchNumber}</span></p>
                  )}
                </div>
                <span className="font-mono font-semibold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {rx.notes && (
          <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
            <strong>Catatan Dokter:</strong> {rx.notes}
          </div>
        )}

        <div className="pt-8 flex justify-between text-xs text-center border-t border-slate-200">
          <div>
            <p className="text-slate-500 mb-12">Petugas Farmasi / Apoteker</p>
            <p className="font-bold text-slate-900">{rx.dispensedBy || "( apt. Dimas Pratama, S.Farm )"}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-12">Dokter Pemeriksa</p>
            <p className="font-bold text-slate-900">( {rx.doctorName} )</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
