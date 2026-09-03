// stores/ui/share-modal-store.ts
import { create } from "zustand";

interface ShareModalState {
  isOpen: boolean;
  listId: string | null;
  open: (listId: string) => void;
  close: () => void;
}

export const useShareModalStore = create<ShareModalState>((set) => ({
  isOpen: false,
  listId: null,
  open: (listId) => set({ isOpen: true, listId }),
  close: () => set({ isOpen: false, listId: null }),
}));