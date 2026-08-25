"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PatientSelfRegisterForm } from "@/features/registrations/PatientSelfRegisterForm";
import { UserPlus } from "lucide-react";

interface PatientRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to send the patient once their account is created and they're auto-logged-in. */
  redirectTo: string;
}

/**
 * Registration happens as a modal right where the patient asked for it (e.g. the "Ambil
 * Nomor Antrean" CTA on the homepage) instead of a separate page — there's nothing else to
 * navigate away for. Logging back in later still goes through the one shared /login form.
 */
export function PatientRegisterModal({ open, onOpenChange, redirectTo }: PatientRegisterModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle>Daftar Akun Pasien</DialogTitle>
          <DialogDescription>
            Cukup beberapa detik. Setelah ini Anda langsung masuk dan bisa mengambil nomor antrean.
          </DialogDescription>
        </DialogHeader>
        <PatientSelfRegisterForm
          onSuccess={() => {
            onOpenChange(false);
            router.push(redirectTo);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
