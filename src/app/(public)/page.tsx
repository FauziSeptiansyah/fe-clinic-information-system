import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Phone,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Microscope,
  Baby,
  Smile,
  HeartPulse,
  Syringe,
  Activity,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CLINIC_PROFILE, MOCK_DOCTORS, MOCK_SERVICES } from "@/mocks";
import { ROUTES } from "@/config/routes";
import { DoctorAvatarArt } from "@/components/illustrations/DoctorAvatarArt";
import { CalendarCheck, BadgeCheck } from "lucide-react";
import { PatientNavStatus, PatientLoginHint } from "@/components/navigation/PatientNavStatus";

export default function LandingPage() {
  const todayName = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"][new Date().getDay()];

  const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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

  const doctorPhotos: Record<string, string> = {
    "doc-01": "/images/doctors/dr-fauzi-ahmad.jpg",
    "doc-02": "/images/doctors/dr-siti-nurhaliza.jpg",
    "doc-03": "/images/doctors/dr-hendra-wijaya.jpg",
    "doc-04": "/images/doctors/drg-maya-kartika.jpg",
    "doc-05": "/images/doctors/dr-budi-wicaksono.jpg",
    "doc-06": "/images/doctors/dr-dian-permatasari.jpg",
  };

  const departmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    "dept-01": Stethoscope,
    "dept-02": Smile,
    "dept-03": HeartPulse,
    "dept-04": Baby,
    "dept-05": Baby,
    "dept-06": Activity,
    "dept-07": Activity,
    "dept-08": Activity,
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          <PatientNavStatus />
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 to-white pt-16 sm:pt-24 pb-10 border-b border-slate-200">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-[0.4] [background-image:radial-gradient(circle,#93c5fd_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_10%,transparent_70%)]"
        />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center sm:text-left grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 px-3 py-1 font-medium text-xs rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600 inline" />
                Sistem Manajemen Klinik & Apotek Terintegrasi
              </Badge>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                Pelayanan Kesehatan <span className="text-blue-600">Profesional</span>, Terpercaya & Penuh Empati
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {MOCK_CLINIC_PROFILE.description}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <Link href={ROUTES.PUBLIC.TAKE_QUEUE}>
                  <Button size="lg" className="h-12 px-7 shadow-lg shadow-blue-600/20 font-semibold text-sm">
                    <Ticket className="h-4 w-4 mr-2" />
                    Ambil Nomor Antrian Online
                  </Button>
                </Link>
                <a href="#layanan">
                  <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold bg-white">
                    Lihat Layanan Kami
                  </Button>
                </a>
              </div>
              <PatientLoginHint />

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-left max-w-md mx-auto sm:mx-0">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">12+</p>
                  <p className="text-xs text-slate-500 font-medium">Dokter Spesialis & Umum</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">8+</p>
                  <p className="text-xs text-slate-500 font-medium">Poliklinik Lengkap</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">BPJS</p>
                  <p className="text-xs text-slate-500 font-medium">Faskes Tingkat 1 & Umum</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center lg:justify-end pt-4 lg:pt-0">
              <div
                aria-hidden
                className="absolute right-4 top-2 h-[85%] w-[85%] max-w-[380px] rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 rotate-6"
              />
              <div className="relative w-full max-w-[340px]">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white -rotate-2">
                  <Image
                    src="/images/hero/hero-doctor.jpg"
                    alt="Dokter Klinik Pratama Sehat Bersama"
                    width={480}
                    height={580}
                    priority
                    className="w-full h-auto object-cover aspect-[4/5]"
                  />
                </div>

                <div className="absolute -left-6 top-6 sm:-left-10 sm:top-10 bg-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5 border border-slate-100 max-w-[190px]">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <BadgeCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Dokter Bersertifikat</p>
                    <p className="text-[10px] text-slate-500">STR & SIP Aktif</p>
                  </div>
                </div>

                <div className="absolute -right-3 bottom-8 sm:-right-8 sm:bottom-12 bg-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5 border border-slate-100 max-w-[190px]">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CalendarCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Buka {todayName === "SELASA" ? "Hari Ini" : "Setiap Hari"}</p>
                    <p className="text-[10px] text-slate-500">07:30 - 21:00 WIB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="mt-14 lg:mt-16 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <Clock className="h-4.5 w-4.5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium">Jam Buka</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">07:30 - 21:00 WIB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <MapPin className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium">Lokasi</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{MOCK_CLINIC_PROFILE.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <Phone className="h-4.5 w-4.5 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium">Telp / WA</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{MOCK_CLINIC_PROFILE.phone}</p>
              </div>
            </div>
            <Link href={ROUTES.QUEUES.DISPLAY} className="flex items-center gap-3 p-4 sm:p-5 hover:bg-blue-50/60 transition-colors group">
              <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium">Layar Antrian TV</p>
                <p className="text-xs sm:text-sm font-bold text-blue-700 truncate">Buka Display →</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section id="layanan" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
                <Card key={srv.id} className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-3 shadow-sm shadow-blue-500/30">
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Tenaga Medis</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Dokter & Jadwal Praktik</h3>
            <p className="text-sm text-slate-500">
              Tim dokter yang berdedikasi tinggi dengan kualifikasi spesialisasi dan kompetensi primer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DOCTORS.slice(0, 6).map((doc) => {
              const SpecIcon = departmentIcons[doc.departmentId] || Stethoscope;
              const photo = doctorPhotos[doc.id];
              return (
              <Card key={doc.id} className="bg-white shadow-xs border-slate-200 hover:shadow-md hover:border-blue-200 transition-all">
                <CardHeader className="p-5 pb-3 flex flex-row items-start gap-4 space-y-0">
                  <div className="relative shrink-0">
                    {photo ? (
                      <div className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-blue-100">
                        <Image src={photo} alt={doc.name} width={56} height={56} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <DoctorAvatarArt name={doc.name} className="h-14 w-14" />
                    )}
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-sm">
                      <SpecIcon className="h-3 w-3 text-white" />
                    </div>
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
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Process Steps */}
      <section id="alur" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-start">
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
                    className={`flex items-center justify-between p-2 rounded-md text-xs ${
                      isToday ? "bg-blue-50 text-blue-900 font-bold border border-blue-200" : "text-slate-700"
                    }`}
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-slate-200 font-semibold">{MOCK_CLINIC_PROFILE.name}</span>
          </div>
          <p>© 2026 {MOCK_CLINIC_PROFILE.name}. Sistem Informasi Manajemen Klinik & Farmasi.</p>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.PUBLIC.LOGIN} className="text-blue-400 hover:underline">
              Login
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
