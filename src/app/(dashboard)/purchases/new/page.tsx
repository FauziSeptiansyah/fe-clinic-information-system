"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supplierService, medicineService, purchaseService } from "@/services";
import { Supplier, Medicine, PurchaseItem } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { formatCurrency, generateId } from "@/lib/utils";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);

  const [selectedSupplierId, setSelectedSupplierId] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<PurchaseItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [itemMedId, setItemMedId] = React.useState("");
  const [itemBatch, setItemBatch] = React.useState("B-AUTO-2026");
  const [itemExpired, setItemExpired] = React.useState("2028-12-31");
  const [itemQty, setItemQty] = React.useState(100);
  const [itemPrice, setItemPrice] = React.useState(1000);

  React.useEffect(() => {
    async function load() {
      const [sups, meds] = await Promise.all([
        supplierService.getAll(),
        medicineService.getAll(),
      ]);
      setSuppliers(sups);
      setMedicines(meds);
    }
    load();
  }, []);

  const handleMedChange = (medId: string) => {
    setItemMedId(medId);
    const med = medicines.find((m) => m.id === medId);
    if (med) {
      setItemPrice(med.purchasePrice);
    }
  };

  const handleAddItem = () => {
    const med = medicines.find((m) => m.id === itemMedId);
    if (!med) {
      toast.error("Pilih obat terlebih dahulu.");
      return;
    }

    const newItem: PurchaseItem = {
      id: generateId("poi"),
      medicineId: med.id,
      medicineName: med.name,
      batchNumber: itemBatch,
      expiredDate: itemExpired,
      quantity: Number(itemQty),
      unit: med.unit,
      purchasePrice: Number(itemPrice),
      subtotal: Number(itemQty) * Number(itemPrice),
    };

    setItems([...items, newItem]);
    setItemMedId("");
    setItemBatch("B-AUTO-" + Math.floor(Math.random() * 9000 + 1000));
    toast.success(`${med.name} dimasukkan ke rincian PO.`);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const tax = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.error("Pilih distributor / supplier.");
      return;
    }
    if (items.length === 0) {
      toast.error("Tambahkan minimal 1 item obat ke dalam PO.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await purchaseService.create({
        supplierId: selectedSupplierId,
        purchaseDate,
        items,
        notes,
      });

      toast.success(`Penerimaan PO ${res.purchaseNumber} berhasil disimpan. Stok obat otomatis bertambah!`);
      router.push(ROUTES.PURCHASES.LIST);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal membuat PO.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Link href={ROUTES.PURCHASES.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Daftar Pembelian
        </Link>
      </div>

      <PageHeader
        title="Buat Faktur Pembelian (PO) & Penerimaan Batch"
        description="Catat pengadaan obat masuk, nomor batch, dan tanggal expired untuk sistem FEFO."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Informasi Supplier & Faktur</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Distributor / Supplier *</Label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih Supplier..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tanggal Faktur / Penerimaan *</Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">Catatan Pengadaan / No. Surat Jalan</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cth: No. Surat Jalan PBF-12345, barang diterima kondisi baik..."
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Rincian Obat & Nomor Batch</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[11px] font-semibold">Pilih Obat</Label>
                <select
                  value={itemMedId}
                  onChange={(e) => handleMedChange(e.target.value)}
                  className="w-full h-8 text-xs rounded border border-slate-300 bg-white px-2"
                >
                  <option value="">-- Pilih Obat --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">No. Batch</Label>
                <Input value={itemBatch} onChange={(e) => setItemBatch(e.target.value)} className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Tgl Expired</Label>
                <Input type="date" value={itemExpired} onChange={(e) => setItemExpired(e.target.value)} className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Qty</Label>
                <Input type="number" min="1" value={itemQty} onChange={(e) => setItemQty(Number(e.target.value))} className="h-8 text-xs" />
              </div>

              <Button type="button" size="sm" onClick={handleAddItem} className="h-8 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Tambah
              </Button>
            </div>

            {items.length > 0 ? (
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3 text-left">Nama Obat</th>
                      <th className="p-3 text-left">Batch</th>
                      <th className="p-3 text-left">Expired</th>
                      <th className="p-3 text-right">Jumlah</th>
                      <th className="p-3 text-right">Harga Beli</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className="p-3 font-semibold text-slate-900">{it.medicineName}</td>
                        <td className="p-3 font-mono">{it.batchNumber}</td>
                        <td className="p-3">{it.expiredDate}</td>
                        <td className="p-3 text-right font-mono font-bold">{it.quantity} {it.unit}</td>
                        <td className="p-3 text-right">{formatCurrency(it.purchasePrice)}</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(it.subtotal)}</td>
                        <td className="p-3 text-center">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(it.id)} className="h-7 w-7 text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">Belum ada obat dalam rincian PO ini.</p>
            )}

            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN (11%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-1">
                  <span>Total Faktur:</span>
                  <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
            <Link href={ROUTES.PURCHASES.LIST}>
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs">
              <Save className="h-4 w-4 mr-1.5" />
              {isSubmitting ? "Menyimpan PO..." : "Simpan PO & Tambah Stok Masuk"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </PageContainer>
  );
}
