"use client";

import * as React from "react";
import { prescriptionService, medicineService, visitService } from "@/services";
import { Prescription, MedicineBatch, PrescriptionStatus, Visit } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pill, CheckCircle, RefreshCw } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function PharmacyBoardPage() {
  const user = useAuthStore((s) => s.user);
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [batches, setBatches] = React.useState<MedicineBatch[]>([]);

  const [selectedRx, setSelectedRx] = React.useState<Prescription | null>(null);
  const [batchAllocations, setBatchAllocations] = React.useState<Record<string, string>>({});
  const [isDispensing, setIsDispensing] = React.useState(false);

  const fetchPrescriptions = React.useCallback(() => {
    Promise.all([prescriptionService.getAll(), medicineService.getBatches(), visitService.getAll()]).then(([rxs, bts, vs]) => {
      setPrescriptions(rxs);
      setBatches(bts);
      setVisits(vs);
    });
  }, []);

  React.useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // A prescription only becomes pharmacy's job once nurse follow-up has actually routed the
  // visit to WAITING_PHARMACY — not merely because the doctor attached items to it.
  const visitsWaitingPharmacy = new Set(visits.filter((v) => v.status === "WAITING_PHARMACY").map((v) => v.id));

  const handleOpenDispense = (rx: Prescription) => {
    setSelectedRx(rx);
    const initialAlloc: Record<string, string> = {};
    rx.items.forEach((item) => {
      const validBatches = batches.filter((b) => b.medicineId === item.medicineId && b.status !== "EXPIRED" && b.remainingQuantity >= item.quantity);
      if (validBatches.length > 0) {
        initialAlloc[item.id] = validBatches[0].id;
      }
    });
    setBatchAllocations(initialAlloc);
  };

  const handleConfirmDispense = async () => {
    if (!selectedRx) return;
    try {
      setIsDispensing(true);
      await prescriptionService.dispense(selectedRx.id, user?.name || "Apoteker", batchAllocations);
      toast.success(`Obat untuk ${selectedRx.patientName} berhasil disiapkan dan diserahkan!`);
      setSelectedRx(null);
      fetchPrescriptions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memproses dispensing obat.");
      }
    } finally {
      setIsDispensing(false);
    }
  };

  const handleUpdateStatus = async (rxId: string, status: PrescriptionStatus) => {
    try {
      await prescriptionService.updateStatus(rxId, status);
      toast.success("Status resep diperbarui.");
      fetchPrescriptions();
    } catch {
      toast.error("Gagal memperbarui status resep.");
    }
  };

  const pendingList = prescriptions.filter((r) => r.status === "PENDING" && visitsWaitingPharmacy.has(r.visitId));
  const processingList = prescriptions.filter((r) => r.status === "PROCESSING");
  const readyList = prescriptions.filter((r) => r.status === "READY");
  const completedList = prescriptions.filter((r) => r.status === "COMPLETED");

  return (
    <PageContainer>
      <PageHeader
        title="Papan Dispensing Farmasi & Apotek"
        description="Alur penyiapan obat, pemilihan nomor batch First Expired First Out (FEFO), dan penyerahan obat ke pasien."
        actions={
          <Button variant="outline" size="sm" onClick={fetchPrescriptions} className="text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Segarkan
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Col 1: Pending */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase">1. Menunggu Diracik</span>
            <Badge variant="warning">{pendingList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {pendingList.map((rx) => (
              <Card key={rx.id} className="shadow-xs border-slate-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-purple-700">{rx.prescriptionNumber}</span>
                    <StatusBadge status={rx.status} type="prescription" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{rx.patientName}</p>
                    <p className="text-xs text-slate-500">{rx.doctorName} • {rx.departmentName}</p>
                  </div>
                  <div className="text-xs bg-slate-50 p-2 rounded text-slate-700 space-y-1">
                    {rx.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.medicineName}</span>
                        <span className="font-semibold">{i.quantity} {i.unit}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(rx.id, "PROCESSING")}
                    className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 font-semibold"
                  >
                    Mulai Racik Obat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Col 2: Processing */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase">2. Sedang Diracik</span>
            <Badge variant="default">{processingList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {processingList.map((rx) => (
              <Card key={rx.id} className="shadow-xs border-blue-200 bg-blue-50/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-700">{rx.prescriptionNumber}</span>
                    <StatusBadge status={rx.status} type="prescription" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{rx.patientName}</p>
                    <p className="text-xs text-slate-500">{rx.items.length} Item Obat</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(rx.id, "READY")}
                    className="w-full text-xs h-8 bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                  >
                    Tandai Siap Serah
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Col 3: Ready */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">3. Siap Diserahkan</span>
            <Badge variant="success">{readyList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {readyList.map((rx) => (
              <Card key={rx.id} className="shadow-xs border-emerald-200 bg-emerald-50/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-700">{rx.prescriptionNumber}</span>
                    <StatusBadge status={rx.status} type="prescription" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{rx.patientName}</p>
                    <p className="text-xs text-slate-500">{rx.patientMrNumber}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenDispense(rx)}
                    className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Dispense & Serahkan (FEFO)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Col 4: Completed */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">4. Selesai Diambil</span>
            <Badge variant="secondary">{completedList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {completedList.map((rx) => (
              <Card key={rx.id} className="shadow-xs border-slate-200 opacity-85">
                <CardContent className="p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{rx.prescriptionNumber}</span>
                    <StatusBadge status={rx.status} type="prescription" />
                  </div>
                  <p className="font-semibold text-slate-900">{rx.patientName}</p>
                  <p className="text-[11px] text-slate-500">Diserahkan: {formatDateTime(rx.dispensedAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedRx} onOpenChange={() => setSelectedRx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Pill className="h-5 w-5 text-purple-600" />
              Konfirmasi Pengeluaran Obat FEFO
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pilih nomor batch obat yang akan dikeluarkan sesuai prinsip First Expired First Out (FEFO).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-3 bg-slate-50 rounded text-xs space-y-1">
              <p>Pasien: <strong className="text-slate-900">{selectedRx?.patientName}</strong> ({selectedRx?.patientMrNumber})</p>
              <p>No Resep: <span className="font-mono text-purple-700">{selectedRx?.prescriptionNumber}</span></p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedRx?.items.map((item) => {
                const itemBatches = batches.filter((b) => b.medicineId === item.medicineId);

                return (
                  <div key={item.id} className="p-3 border border-slate-200 rounded-md text-xs space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span>{item.medicineName} ({item.quantity} {item.unit})</span>
                      <span className="text-slate-500">{item.frequency}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">Alokasi Batch (Urutan FEFO):</label>
                      <select
                        value={batchAllocations[item.id] || ""}
                        onChange={(e) => setBatchAllocations({ ...batchAllocations, [item.id]: e.target.value })}
                        className="w-full h-8 text-xs rounded border border-slate-300 bg-white px-2"
                      >
                        {itemBatches.map((b) => (
                          <option
                            key={b.id}
                            value={b.id}
                            disabled={b.status === "EXPIRED" || b.remainingQuantity < item.quantity}
                          >
                            {b.batchNumber} — Exp: {formatDate(b.expiredDate)} (Sisa: {b.remainingQuantity}) {b.status === "EXPIRED" ? "⛔ KEDALUWARSA" : b.status === "EXPIRING_SOON" ? "⚠️ SEGERA EXP" : "✅ AMAN"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedRx(null)}>Batal</Button>
            <Button size="sm" disabled={isDispensing} onClick={handleConfirmDispense} className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs">
              {isDispensing ? "Memotong Stok..." : "Konfirmasi & Serahkan Obat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
