import { ViewMode } from "@/app/(front)/model/type/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";
interface CalendarState {
  View: ViewMode;
  setView: (type: ViewMode) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      View: "month",
      setView: (type) => set({ View: type }),
    }),
    {
      name: "calendar-storage", 
      partialize: (state) => ({ View: state.View }),
    }
  )
);