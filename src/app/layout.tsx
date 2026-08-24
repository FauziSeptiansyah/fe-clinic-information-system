import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Klinik Pratama Sehat Bersama — Sistem Informasi Manajemen Klinik & Farmasi",
  description:
    "Sistem manajemen klinik terpadu: Pendaftaran, Antrian Poliklinik, Rekam Medis Elektronik (RME SOAP), Farmasi Apotek FEFO, Billing & Kasir.",
  keywords: ["klinik", "apotek", "rekam medis", "BPJS", "antrian klinik", "SIMKlinik"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
