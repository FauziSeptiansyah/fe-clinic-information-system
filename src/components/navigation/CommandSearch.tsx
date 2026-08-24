"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User, Pill, Stethoscope, ArrowRight } from "lucide-react";
import { patientService, doctorService, medicineService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Patient, Doctor, Medicine } from "@/types";

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (open) {
      patientService.getAll().then(setPatients);
      doctorService.getAll().then(setDoctors);
      medicineService.getAll().then(setMedicines);
    }
  }, [open]);

  const filteredPatients = query.trim()
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query.toLowerCase()) ||
          p.mrNumber.toLowerCase().includes(query.toLowerCase()) ||
          p.nik.includes(query)
      ).slice(0, 4)
    : [];

  const filteredDoctors = query.trim()
    ? doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.specialization.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredMedicines = query.trim()
    ? medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/75 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-colors w-44 sm:w-64 justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Cari pasien, obat, dokter...</span>
        </div>
        <kbd className="pointer-events-none hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1 text-[10px] font-mono font-medium text-slate-400">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-xl overflow-hidden gap-0 border-slate-200 shadow-2xl">
          <div className="flex items-center border-b border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik nama pasien, No RM, nama obat, atau dokter..."
              className="border-0 focus-visible:ring-0 text-sm px-0 py-3 shadow-none bg-transparent"
              autoFocus
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2 space-y-3">
            {query.trim() === "" ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Ketik kata kunci untuk mencari seluruh modul dalam sistem klinik.
              </div>
            ) : (
              <>
                {/* Patients Result */}
                {filteredPatients.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Pasien</div>
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(ROUTES.PATIENTS.DETAIL(p.id))}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">{p.fullName}</p>
                            <p className="text-[11px] text-slate-500">{p.mrNumber} • NIK: {p.nik}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Doctors Result */}
                {filteredDoctors.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Dokter</div>
                    {filteredDoctors.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect(ROUTES.MASTER.DOCTORS)}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">{d.name}</p>
                            <p className="text-[11px] text-slate-500">{d.specialization} • {d.departmentName}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Medicines Result */}
                {filteredMedicines.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Obat & Farmasi</div>
                    {filteredMedicines.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect(ROUTES.MEDICINES.DETAIL(m.id))}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">{m.name}</p>
                            <p className="text-[11px] text-slate-500">{m.code} • Stok: {m.currentStock} {m.unit}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {filteredPatients.length === 0 && filteredDoctors.length === 0 && filteredMedicines.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Tidak ada hasil yang cocok dengan &quot;<strong>{query}</strong>&quot;.
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
