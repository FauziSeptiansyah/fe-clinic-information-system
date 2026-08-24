"use client";

import * as React from "react";
import { clinicService } from "@/services";
import { ClinicProfile } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function ClinicSettingsPage() {
  const [profile, setProfile] = React.useState<ClinicProfile | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    clinicService.getProfile().then(setProfile);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setIsSaving(true);
      await clinicService.updateProfile(profile);
      toast.success("Profil klinik berhasil diperbarui.");
    } catch {
      toast.error("Gagal menyimpan profil klinik.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Link href={ROUTES.SETTINGS.INDEX} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Pengaturan
        </Link>
      </div>

      <PageHeader
        title="Profil Fasilitas Pelayanan Kesehatan"
        description="Identitas resmi klinik yang tercetak pada tiket antrian, lembar resep, dan kuitansi tagihan."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Informasi Resmi Faskes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Nama Resmi Fasilitas Kesehatan</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tagline / Slogan Klinik</Label>
              <Input
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">No. Telepon / Hotline</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Alamat Lengkap Fasilitas</Label>
              <Textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="text-xs min-h-[60px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kota / Kabupaten</Label>
              <Input
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Kontak</Label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="text-xs"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
              <Save className="h-4 w-4 mr-1.5" />
              {isSaving ? "Menyimpan..." : "Simpan Profil Faskes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </PageContainer>
  );
}
