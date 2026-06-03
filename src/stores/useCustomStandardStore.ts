import { create } from 'zustand';
import { CustomStandard, createCustomStandard, getAllCustomStandards, deleteCustomStandard } from '../db/customStandards';

interface CustomStandardState {
  standards: CustomStandard[];
  loading: boolean;
  loadStandards: () => void;
  addStandard: (name: string) => CustomStandard;
  removeStandard: (id: string) => void;
}

export const useCustomStandardStore = create<CustomStandardState>((set) => ({
  standards: [],
  loading: false,
  loadStandards: () => {
    try {
      const standards = getAllCustomStandards();
      set({ standards, loading: false });
    } catch {
      set({ standards: [], loading: false });
    }
  },
  addStandard: (name) => {
    const s = createCustomStandard(name);
    set((st) => ({ standards: [...st.standards, s] }));
    return s;
  },
  removeStandard: (id) => {
    deleteCustomStandard(id);
    set((st) => ({ standards: st.standards.filter((s) => s.id !== id) }));
  },
}));
