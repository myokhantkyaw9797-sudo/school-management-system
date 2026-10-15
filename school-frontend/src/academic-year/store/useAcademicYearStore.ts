import { create } from 'zustand';

interface AcademicYearState {
  selectedYearId: string | null;
  selectedYearName: string;
  setSelectedYear: (id: string, name: string) => void;
}

export const useAcademicYearStore = create<AcademicYearState>((set) => ({
  selectedYearId: null,
  selectedYearName: '2025-2026', // Default ရွေးထားသည့် ပညာသင်နှစ်
  setSelectedYear: (id, name) => set({ selectedYearId: id, selectedYearName: name }),
}));