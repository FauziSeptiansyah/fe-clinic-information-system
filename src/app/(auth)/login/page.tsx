"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore, MOCK_USERS } from "@/stores/authStore";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { patientService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Lock, Mail, ArrowLeft, ShieldCheck, Clock, MapPin, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { ClinicHero } from "@/components/illustrations/ClinicHero";
import { LoadingState } from "@/components/common/LoadingState";
import { MOCK_CLINIC_PROFILE, MOCK_PATIENTS } from "@/mocks";
import { Patient } from "@/types";
import { UserRound } from "lucide-react";

const DEMO_PATIENTS = MOCK_PATIENTS.filter((p) => ["pat-07", "pat-01"].includes(p.id));

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const login = useAuthStore((state) => state.login);
  const switchRole = useAuthStore((state) => state.switchRole);
  const loginPatient = usePatientAuthStore((state) => state.loginPatient);
  const loggedInPatient = usePatientAuthStore((state) => state.patient);

  const [email, setEmail] = React.useState("admin@kliniksehat.co.id");
  const [password, setPassword] = React.useState("password123");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Already signed in as a patient (e.g. via browser back) — this form is stale, forward them on.
    if (loggedInPatient) router.replace(redirectTo || ROUTES.PATIENT.DASHBOARD);
  }, [loggedInPatient, router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan masukkan email dan kata sandi Anda.");
      return;
    }
    setIsLoading(true);

    // Staff accounts (demo: any registered staff email logs in, no password check — same as before).
    const staffMatch = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (staffMatch) {
      login(email);
      toast.success("Berhasil masuk ke sistem manajemen klinik.");
      setIsLoading(false);
      router.replace(redirectTo || ROUTES.DASHBOARD);
      return;
    }

    // Patient accounts (self-registered via /register): checked by email + password.
    const patients = await patientService.getAll();
    const patientMatch = patients.find((p) => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (patientMatch && patientMatch.password && patientMatch.password === password) {
      loginPatient(patientMatch);
      toast.success(`Selamat datang, ${patientMatch.fullName}!`);
      setIsLoading(false);
      router.replace(redirectTo || ROUTES.PATIENT.DASHBOARD);
      return;
    }

    setIsLoading(false);
    toast.error("Email atau kata sandi salah.");
  };

  const handleQuickLogin = (selectedUser: typeof MOCK_USERS[0]) => {
    setEmail(selectedUser.email);
    switchRole(selectedUser.role);
    toast.success(`Masuk sebagai: ${selectedUser.name} (${selectedUser.role})`);
    router.replace(redirectTo || ROUTES.DASHBOARD);
  };

  const handleQuickPatientLogin = (selectedPatient: Patient) => {
    setEmail(selectedPatient.email || "");
    loginPatient(selectedPatient);
    toast.success(`Masuk sebagai pasien: ${selectedPatient.fullName}`);
    router.replace(redirectTo || ROUTES.PATIENT.DASHBOARD);
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-600 selection:text-white">
      {/* Left brand / illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex-col p-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:24px_24px]"
        />
        <Link href="/" className="relative inline-flex items-center gap-2.5 text-sm font-semibold text-blue-100 hover:text-white transition-colors w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/20">
            <Building2 className="h-5 w-5" />
          </div>
          {MOCK_CLINIC_PROFILE.name}
        </Link>

        <div className="relative flex-1 flex flex-col items-center justify-center gap-6">
          <ClinicHero className="w-full max-w-sm h-auto drop-shadow-2xl" />
          <div className="text-center space-y-2 max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight">Portal Sistem Manajemen Klinik</h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Kelola antrian, rekam medis, farmasi, dan kasir dalam satu sistem terpadu — cepat, rapi, dan mudah dipakai tim medis.
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2.5">
            <Clock className="h-4 w-4 text-blue-300 shrink-0" />
            <span className="text-blue-100">07:30–21:00 WIB</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2.5">
            <Stethoscope className="h-4 w-4 text-blue-300 shrink-0" />
            <span className="text-blue-100">Faskes BPJS Tk. 1</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2.5">
            <MapPin className="h-4 w-4 text-blue-300 shrink-0" />
            <span className="text-blue-100 truncate">{MOCK_CLINIC_PROFILE.city}</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-16">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Halaman Publik Klinik
        </Link>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Portal Sistem Klinik
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Klinik Pratama Sehat Bersama • Rekam Medis & Farmasi
        </p>
      </div>

      <div className="mt-6 lg:mt-0 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 w-full">
        <div className="hidden lg:block mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Halaman Publik Klinik
          </Link>
        </div>
        <Card className="shadow-lg border-slate-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Login</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Satu akun untuk semua — staf klinik maupun pasien terdaftar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Kata Sandi</Label>
                  <a href="#" onClick={(e) => { e.preventDefault(); toast.info("Silakan hubungi administrator untuk reset kata sandi."); }} className="text-[11px] text-blue-600 hover:underline font-medium">
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold text-xs h-9 shadow-sm" disabled={isLoading}>
                {isLoading ? "Memverifikasi..." : "Login"}
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center">
              Pasien baru?{" "}
              <Link
                href={redirectTo ? `${ROUTES.PUBLIC.REGISTER}?redirect=${encodeURIComponent(redirectTo)}` : ROUTES.PUBLIC.REGISTER}
                className="text-blue-600 font-semibold hover:underline"
              >
                Daftar akun pasien
              </Link>
            </p>

            {/* Quick Demo Role Switcher */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Akses Cepat Pengujian (Role Switcher)
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {MOCK_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex flex-col text-left p-2 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-[11px] font-bold text-slate-800 truncate">{u.role}</span>
                    <span className="text-[10px] text-slate-500 truncate">{u.name.split(",")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Demo Patient Login */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <UserRound className="h-3.5 w-3.5 text-blue-600" />
                Akses Cepat Pengujian (Pasien)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_PATIENTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickPatientLogin(p)}
                    className="flex flex-col text-left p-2 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-[11px] font-bold text-slate-800 truncate">{p.fullName}</span>
                    <span className="text-[10px] text-slate-500 truncate">{p.mrNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingState title="Memuat..." /></div>}>
      <LoginPageContent />
    </React.Suspense>
  );
}
