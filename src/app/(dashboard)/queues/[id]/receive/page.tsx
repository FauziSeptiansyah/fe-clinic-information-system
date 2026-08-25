"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { queueService, visitService, patientService } from "@/services";
import { Queue, Patient } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar, DetailRow } from "@/components/common/Displays";
import { UserPlus, Search, UserCheck2, ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

function ReceiveQueueContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [queue, setQueue] = React.useState<Queue | null | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [allPatients, setAllPatients] = React.useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([queueService.getById(params.id), patientService.getAll()]).then(([q, patients]) => {
      if (cancelled) return;
      setQueue(q);
      setAllPatients(patients);

      if (q?.patientId) {
        setSelectedPatient(patients.find((p) => p.id === q.patientId) || null);
      }
      const prefillId = searchParams.get("patientId");
      if (prefillId) {
        setSelectedPatient(patients.find((p) => p.id === prefillId) || null);
      }

      // CS has opened this entry — mark it actively being processed (once).
      if (q && q.status === "CALLED" && !startedRef.current) {
        startedRef.current = true;
        queueService.startQueue(q.id).then((updated) => setQueue(updated));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const filteredPatients = searchQuery.trim()
    ? allPatients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nik.includes(searchQuery) ||
          p.phone.includes(searchQuery)
      )
    : [];

  const handleConfirm = async () => {
    if (!queue || !selectedPatient) return;
    try {
      setIsSubmitting(true);
      await visitService.createFromQueue(queue.id, selectedPatient.id, user?.name);
      toast.success(`Pasien ${selectedPatient.fullName} diteruskan ke perawat.`);
      router.push(ROUTES.QUEUES.LIST);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses antrean.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (queue === undefined) {
    return (
      <PageContainer>
        <LoadingState title="Memuat antrean..." />
      </PageContainer>
    );
  }

  if (!queue) {
    return (
      <PageContainer>
        <EmptyState title="Antrean tidak ditemukan" description="Nomor antrean ini mungkin sudah diproses atau tidak ada." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="sm">
      <PageHeader
        title={`Terima Antrean ${queue.queueNumber}`}
        description="Identifikasi & lengkapi data pasien sebelum diteruskan ke perawat."
      />

      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Tujuan Layanan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <DetailRow label="Poliklinik" value={queue.departmentName} />
          <DetailRow label="Dokter" value={queue.doctorName} />
          <DetailRow label="Layanan" value={queue.serviceName} />
          <DetailRow label="Penjamin" value={queue.payerType} />
        </CardContent>
      </Card>

      {selectedPatient ? (
        <Card className="shadow-xs border-blue-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Data Pasien</CardTitle>
            <CardDescription className="text-xs text-slate-500">Periksa kesesuaian identitas sebelum melanjutkan.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200">
              <UserAvatar name={selectedPatient.fullName} size="lg" />
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedPatient.fullName}</p>
                <p className="text-xs text-slate-600 font-mono">{selectedPatient.mrNumber}</p>
              </div>
            </div>
            <DetailRow label="No. HP" value={selectedPatient.phone || "-"} />
            <DetailRow label="NIK" value={selectedPatient.nik || "-"} />
            {!queue.patientId && (
              <Button type="button" variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => setSelectedPatient(null)}>
                Ganti pasien
              </Button>
            )}
            <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full font-semibold shadow-xs">
              <UserCheck2 className="h-4 w-4 mr-1.5" />
              {isSubmitting ? "Memproses..." : "Konfirmasi & Lanjutkan ke Perawat"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xs border-amber-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Identifikasi Pasien</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Antrean ini diambil dari kiosk dan belum teridentifikasi. Cari pasien terdaftar atau daftarkan pasien baru.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama / No RM / NIK / No HP..."
                className="pl-9 text-xs"
              />
            </div>

            {searchQuery.trim() && (
              <div className="divide-y divide-slate-100 rounded-md border border-slate-200 overflow-hidden max-h-56 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">Pasien tidak ditemukan.</div>
                ) : (
                  filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className="p-3 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={p.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{p.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{p.mrNumber} • {p.phone}</p>
                        </div>
                      </div>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs shrink-0">Pilih</Button>
                    </div>
                  ))
                )}
              </div>
            )}

            <Link href={`${ROUTES.PATIENTS.NEW}?returnTo=${ROUTES.QUEUES.RECEIVE(queue.id)}`} className="block pt-1">
              <Button type="button" variant="outline" className="w-full text-xs">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Daftarkan Pasien Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

export default function ReceiveQueuePage() {
  return (
    <React.Suspense fallback={<PageContainer><LoadingState title="Memuat..." /></PageContainer>}>
      <ReceiveQueueContent />
    </React.Suspense>
  );
}
