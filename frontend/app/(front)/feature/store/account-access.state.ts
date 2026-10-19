import { create } from 'zustand';

// Recheck with the server on a new page load rather than persisting a ban locally.
export const useAccountAccessState = create<{ blocked: boolean; markBlocked: () => void }>((set) => ({
  blocked: false,
  markBlocked: () => set({ blocked: true }),
}));
