import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { MedicineForm } from "@/features/medicines/MedicineForm";

export default function NewMedicinePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tambah Obat Baru"
        description="Pencatatan data master obat, harga beli, harga jual, dan satuan."
      />
      <MedicineForm mode="create" />
    </PageContainer>
  );
}
