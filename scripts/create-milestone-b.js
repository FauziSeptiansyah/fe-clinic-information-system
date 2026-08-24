const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf8");
  console.log("Created: " + filePath);
}

// 1. (public)/page.tsx - Professional Clinic Landing Page
writeFile("src/app/(public)/page.tsx", `
import Link from "next/link";
import {
  Building2,
  Phone,
  Clock,
  MapPin,
  Mail,
  ArrowRight,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Pill,
  Microscope,
  Baby,
  Smile,
  HeartPulse,
  Syringe,
  Activity,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CLINIC_PROFILE, MOCK_DOCTORS, MOCK_SERVICES } from "@/mocks";
import { ROUTES } from "@/config/routes";

export default function LandingPage() {
  const todayName = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"][new Date().getDay()];

  const serviceIcons: Record<string, any> = {
    "SRV-UMUM": Stethoscope,
    "SRV-SPES": HeartPulse,
    "SRV-GIGI": Smile,
    "SRV-KIA": Baby,
    "SRV-VAKSIN": Syringe,
    "SRV-LAB-DARAH": Microscope,
    "SRV-LAB-GULA": Activity,
    "SRV-LAB-KOLESTEROL": Activity,
    "SRV-EKG": HeartPulse,
    "SRV-NEBULIZER": Activity,
  };

  const processSteps = [
    { step: "1", title: "Registrasi Pasien", desc: "Pendaftaran mandiri atau melalui resepsionis dengan data NIK/BPJS/Umum." },
    { step: "2", title: "Nomor Antrian", desc: "Dapatkan nomor antrian poliklinik terintegrasi dengan layar pemanggil audio & TV." },
    { step: "3", title: "Pemeriksaan Dokter", desc: "Konsultasi medis komprehensif, pemeriksaan fisik, dan rekam medis elektronik SOAP." },
    { step: "4", title: "Resep & Tindakan", desc: "E-Resep langsung terkirim ke sistem farmasi dan instruksi tindakan medis terintegrasi." },
    { step: "5", title: "Pembayaran & Obat", desc: "Kasir melayani pembayaran tunai/QRIS/BPJS, lalu pasien mengambil obat di loket farmasi." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight leading-tight block">
                {MOCK_CLINIC_PROFILE.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none block">
                {MOCK_CLINIC_PROFILE.city} • Pelayanan Medis Primer
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#tentang" className="hover:text-blue-600 transition-colors">Tentang</a>
            <a href="#layanan" className="hover:text-blue-600 transition-colors">Layanan</a>
            <a href="#dokter" className="hover:text-blue-600 transition-colors">Dokter & Jadwal</a>
            <a href="#alur" className="hover:text-blue-600 transition-colors">Alur Pelayanan</a>
            <a href="#jadwal" className="hover:text-blue-600 transition-colors">Jam Buka</a>
            <a href="#kontak" className="hover:text-blue-600 transition-colors">Kontak</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={ROUTES.PUBLIC.LOGIN}>
              <Button size="sm" className="font-semibold shadow-sm">
                <LogIn className="h-4 w-4 mr-1.5" />
                Masuk ke Sistem
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 to-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 px-3 py-1 font-medium text-xs rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600 inline" />
              Sistem Manajemen Klinik & Apotek Terintegrasi
            </Badge>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pelayanan Kesehatan Profesional, Terpercaya & Penuh Empati
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              {MOCK_CLINIC_PROFILE.description}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <Link href={ROUTES.PUBLIC.LOGIN}>
                <Button size="lg" className="h-11 px-6 shadow-md font-semibold text-sm">
                  Masuk ke Portal Staf
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="#layanan">
                <Button variant="outline" size="lg" className="h-11 px-6 text-sm font-semibold bg-white">
                  Lihat Layanan Kami
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-left">
              <div>
                <p className="text-2xl font-bold text-blue-600">12+</p>
                <p className="text-xs text-slate-500 font-medium">Dokter Spesialis & Umum</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">8+</p>
                <p className="text-xs text-slate-500 font-medium">Poliklinik Lengkap</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">BPJS</p>
                <p className="text-xs text-slate-500 font-medium">Faskes Tingkat 1 & Umum</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <Card className="w-full max-w-md shadow-lg border-blue-100 bg-white/95">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg p-5">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Informasi Operasional Hari Ini</span>
                  <Badge variant="secondary" className="bg-white/20 text-white text-[11px] font-medium border-0">
                    {todayName}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-blue-100 text-xs mt-1">
                  Klinik buka melayani rawat jalan & farmasi
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Jam Buka: <strong>07:30 - 21:00 WIB</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{MOCK_CLINIC_PROFILE.address}, {MOCK_CLINIC_PROFILE.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Telp: {MOCK_CLINIC_PROFILE.phone} / WA: {MOCK_CLINIC_PROFILE.whatsapp}</span>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <Link href={ROUTES.QUEUES.DISPLAY} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50">
                      Buka Layar Antrian TV (Display Antrian)
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section id="layanan" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Layanan Poliklinik</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Pelayanan Medis Komprehensif</h3>
            <p className="text-sm text-slate-500">
              Dilengkapi dengan dokter spesialis berpengalaman, fasilitas laboratorium diagnostik, dan apotek terintegrasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MOCK_SERVICES.slice(0, 8).map((srv) => {
              const Icon = serviceIcons[srv.code] || Stethoscope;
              return (
                <Card key={srv.id} className="hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">{srv.name}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {srv.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="text-xs font-semibold text-blue-700 mt-2 bg-blue-50/60 rounded px-2 py-1 inline-block">
                      {srv.category}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Doctors & Schedule */}
      <section id="dokter" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Tenaga Medis</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Dokter & Jadwal Praktik</h3>
            <p className="text-sm text-slate-500">
              Tim dokter yang berdedikasi tinggi dengan kualifikasi spesialisasi dan kompetensi primer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DOCTORS.slice(0, 6).map((doc) => (
              <Card key={doc.id} className="bg-white shadow-xs border-slate-200">
                <CardHeader className="p-5 pb-3 flex flex-row items-start gap-4 space-y-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-200">
                    {doc.name.split(" ")[0].slice(0, 2)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 leading-snug">{doc.name}</CardTitle>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.licenseNumber}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Jadwal Praktik:</p>
                    {doc.schedules.map((sch) => (
                      <div key={sch.id} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded">
                        <span className="font-semibold">{sch.day}</span>
                        <span className="text-slate-500">{sch.startTime} - {sch.endTime} WIB</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Process Steps */}
      <section id="alur" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Alur Kunjungan</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Proses Pelayanan Pasien</h3>
            <p className="text-sm text-slate-500">
              Alur pelayanan yang tertib, cepat, dan transparan dari registrasi hingga pengambilan obat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {processSteps.map((step) => (
              <div key={step.step} className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 relative">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {step.step}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Operating Hours & Location */}
      <section id="jadwal" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-start">
          <Card className="bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Jam Operasional Poliklinik
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Pendaftaran ditutup 30 menit sebelum jam operasional berakhir.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-2">
              {MOCK_CLINIC_PROFILE.operatingHours.map((op) => {
                const isToday = op.day === todayName;
                return (
                  <div
                    key={op.day}
                    className={\`flex items-center justify-between p-2 rounded-md text-xs \${
                      isToday ? "bg-blue-50 text-blue-900 font-bold border border-blue-200" : "text-slate-700"
                    }\`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{op.day}</span>
                      {isToday && (
                        <Badge variant="outline" className="text-[10px] bg-blue-600 text-white border-0 py-0">
                          Hari Ini
                        </Badge>
                      )}
                    </div>
                    <span>{op.openTime} - {op.closeTime} WIB</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card id="kontak" className="bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Lokasi & Hubungi Kami
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Hubungi kami untuk informasi pendaftaran, rujukan BPJS, atau jadwal dokter.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">Alamat Lengkap</p>
                <p className="text-sm text-slate-900">{MOCK_CLINIC_PROFILE.address}</p>
                <p className="text-xs text-slate-600">{MOCK_CLINIC_PROFILE.city}, {MOCK_CLINIC_PROFILE.province}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Telepon</p>
                  <p className="text-sm font-medium text-slate-900">{MOCK_CLINIC_PROFILE.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">WhatsApp</p>
                  <p className="text-sm font-medium text-slate-900">{MOCK_CLINIC_PROFILE.whatsapp}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                <p className="text-sm font-medium text-slate-900">{MOCK_CLINIC_PROFILE.email}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Link href={ROUTES.PUBLIC.LOGIN} className="w-full">
                  <Button className="w-full font-semibold text-xs">
                    Masuk ke Sistem Manajemen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-slate-200 font-semibold">{MOCK_CLINIC_PROFILE.name}</span>
          </div>
          <p>© 2026 {MOCK_CLINIC_PROFILE.name}. Sistem Informasi Manajemen Klinik & Farmasi.</p>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.PUBLIC.LOGIN} className="text-blue-400 hover:underline">
              Portal Staf
            </Link>
            <Link href={ROUTES.QUEUES.DISPLAY} className="text-blue-400 hover:underline">
              Layar Antrian
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
`);

// 2. (auth)/login/page.tsx - Healthcare Login Screen
writeFile("src/app/(auth)/login/page.tsx", `
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, MOCK_USERS } from "@/stores/authStore";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Lock, Mail, ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const switchRole = useAuthStore((state) => state.switchRole);

  const [email, setEmail] = React.useState("admin@kliniksehat.co.id");
  const [password, setPassword] = React.useState("password123");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Silakan masukkan email Anda.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      login(email);
      toast.success("Berhasil masuk ke sistem manajemen klinik.");
      setIsLoading(false);
      router.push(ROUTES.DASHBOARD);
    }, 400);
  };

  const handleQuickLogin = (selectedUser: typeof MOCK_USERS[0]) => {
    setEmail(selectedUser.email);
    switchRole(selectedUser.role);
    toast.success(\`Masuk sebagai: \${selectedUser.name} (\${selectedUser.role})\`);
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Masuk Akun</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Gunakan email & kata sandi staf yang terdaftar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Email Staf</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kliniksehat.co.id"
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
                {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
              </Button>
            </form>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`);

// 3. (dashboard)/layout.tsx - AppShell wrapper
writeFile("src/app/(dashboard)/layout.tsx", `
import * as React from "react";
import { AppShell } from "@/components/navigation/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
`);

// 4. 403/page.tsx - Forbidden Page
writeFile("src/app/403/page.tsx", `
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403 — Akses Ditolak</h1>
      <p className="max-w-md text-sm text-slate-500 mt-2 mb-6">
        Anda tidak memiliki hak izin (permission) yang cukup untuk mengakses halaman ini. Silakan hubungi Administrator Klinik.
      </p>
      <Link href={ROUTES.DASHBOARD}>
        <Button>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  );
}
`);

// 5. 404/page.tsx - Not Found Page
writeFile("src/app/404/page.tsx", `
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 — Halaman Tidak Ditemukan</h1>
      <p className="max-w-md text-sm text-slate-500 mt-2 mb-6">
        Halaman atau berkas yang Anda cari tidak tersedia atau tautan telah dipindahkan.
      </p>
      <Link href={ROUTES.DASHBOARD}>
        <Button>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  );
}
`);

console.log("Finished generating Milestone B components.");
