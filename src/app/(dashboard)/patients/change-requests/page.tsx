"use client";

import * as React from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { UserAvatar, DateTimeDisplay } from "@/components/common/Displays";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ClipboardCheck, Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { patientChangeRequestService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { PatientChangeRequest } from "@/types";

function DiffRow({ label, from, to }: { label: string; from: string; to: string }) {
  const changed = from !== to;
  return (
    <div className="grid grid-cols-3 gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={changed ? "text-slate-400 line-through" : "text-slate-700"}>{from || "-"}</span>
      <span className={changed ? "text-emerald-700 font-semibold flex items-center gap-1" : "text-slate-700"}>
        {changed && <ArrowRight className="h-3 w-3" />}
        {to || "-"}
      </span>
    </div>
  );
}

export default function PatientChangeRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = React.useState<PatientChangeRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [confirmTarget, setConfirmTarget] = React.useState<{ request: PatientChangeRequest; action: "approve" | "reject" } | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    patientChangeRequestService.getAll().then((all) => {
      if (cancelled) return;
      setRequests(all);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = async () => {
    const all = await patientChangeRequestService.getAll();
    setRequests(all);
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const reviewed = requests.filter((r) => r.status !== "PENDING").slice(0, 10);

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const reviewerName = user?.name || "Staf";
    try {
      setIsProcessing(true);
      if (confirmTarget.action === "approve") {
        await patientChangeRequestService.approve(confirmTarget.request.id, reviewerName);
        toast.success(`Perubahan data ${confirmTarget.request.patientName} disetujui.`);
      } else {
        await patientChangeRequestService.reject(confirmTarget.request.id, reviewerName);
        toast.success(`Perubahan data ${confirmTarget.request.patientName} ditolak.`);
      }
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses permintaan.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Permintaan Perubahan Data Pasien"
        description="Konfirmasi perubahan data dasar (nama, email, No. HP) yang diajukan pasien lewat portal mandiri."
      />

      {isLoading ? (
        <LoadingState title="Memuat permintaan..." />
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Menunggu Konfirmasi ({pending.length})</h2>
            </div>

            {pending.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="Tidak ada permintaan" description="Belum ada permintaan perubahan data yang menunggu konfirmasi." />
            ) : (
              pending.map((r) => (
                <Card key={r.id} className="shadow-xs border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={r.patientName} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{r.patientName}</p>
                          <p className="text-xs text-slate-500 font-mono">{r.patientMrNumber}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Diajukan <DateTimeDisplay date={r.requestedAt} />
                          </p>
                        </div>
                      </div>
                      <Badge variant="warning" className="text-[10px] shrink-0">PENDING</Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-400 uppercase pb-1">
                        <span>Field</span>
                        <span>Sebelum</span>
                        <span>Diajukan</span>
                      </div>
                      <DiffRow label="Nama" from={r.currentValues.fullName} to={r.requestedValues.fullName} />
                      <DiffRow label="Email" from={r.currentValues.email} to={r.requestedValues.email} />
                      <DiffRow label="No. HP" from={r.currentValues.phone} to={r.requestedValues.phone} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="text-xs h-8 flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold"
                        onClick={() => setConfirmTarget({ request: r, action: "approve" })}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setConfirmTarget({ request: r, action: "reject" })}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {reviewed.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-sm font-bold text-slate-900">Riwayat Konfirmasi Terakhir</h2>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden bg-white">
                {reviewed.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{r.patientName}</p>
                      <p className="text-slate-400">
                        {r.reviewedBy} • <DateTimeDisplay date={r.reviewedAt} />
                      </p>
                    </div>
                    <Badge variant={r.status === "APPROVED" ? "success" : "destructive"} className="text-[10px]">
                      {r.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={confirmTarget?.action === "approve" ? "Setujui Perubahan Data?" : "Tolak Perubahan Data?"}
        description={
          confirmTarget?.action === "approve"
            ? `Data ${confirmTarget?.request.patientName} akan diperbarui sesuai permintaan.`
            : `Permintaan perubahan data ${confirmTarget?.request.patientName} akan ditolak.`
        }
        confirmText={confirmTarget?.action === "approve" ? "Ya, Setujui" : "Ya, Tolak"}
        onConfirm={handleConfirm}
        isLoading={isProcessing}
        variant={confirmTarget?.action === "reject" ? "destructive" : "default"}
      />
    </PageContainer>
  );
}
