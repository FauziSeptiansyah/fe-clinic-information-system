import { create } from "zustand";
import { PrescriptionItem, PurchaseItem } from "@/types";

interface CartState {
  prescriptionItems: PrescriptionItem[];
  purchaseItems: PurchaseItem[];
  
  // Prescription Cart Actions
  addPrescriptionItem: (item: PrescriptionItem) => void;
  updatePrescriptionItem: (id: string, item: Partial<PrescriptionItem>) => void;
  removePrescriptionItem: (id: string) => void;
  clearPrescriptionItems: () => void;
  setPrescriptionItems: (items: PrescriptionItem[]) => void;

  // Purchase Cart Actions
  addPurchaseItem: (item: PurchaseItem) => void;
  updatePurchaseItem: (id: string, item: Partial<PurchaseItem>) => void;
  removePurchaseItem: (id: string) => void;
  clearPurchaseItems: () => void;
  setPurchaseItems: (items: PurchaseItem[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
  prescriptionItems: [],
  purchaseItems: [],

  addPrescriptionItem: (item) =>
    set((state) => ({
      prescriptionItems: [...state.prescriptionItems, item],
    })),

  updatePrescriptionItem: (id, updated) =>
    set((state) => ({
      prescriptionItems: state.prescriptionItems.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    })),

  removePrescriptionItem: (id) =>
    set((state) => ({
      prescriptionItems: state.prescriptionItems.filter((item) => item.id !== id),
    })),

  clearPrescriptionItems: () => set({ prescriptionItems: [] }),

  setPrescriptionItems: (items) => set({ prescriptionItems: items }),

  addPurchaseItem: (item) =>
    set((state) => ({
      purchaseItems: [...state.purchaseItems, item],
    })),

  updatePurchaseItem: (id, updated) =>
    set((state) => ({
      purchaseItems: state.purchaseItems.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    })),

  removePurchaseItem: (id) =>
    set((state) => ({
      purchaseItems: state.purchaseItems.filter((item) => item.id !== id),
    })),

  clearPurchaseItems: () => set({ purchaseItems: [] }),

  setPurchaseItems: (items) => set({ purchaseItems: items }),
}));
