import { createContext, useContext, ReactNode } from "react";
import { useCalendar } from "../hooks/useCalendar.hook";

type CalendarContextValue = ReturnType<typeof useCalendar>;

const CalendarContext = createContext<CalendarContextValue | null>(null);

interface CalendarProviderProps {
  children: ReactNode;
  value:CalendarContextValue;
}

export const CalendarProvider = ({ children, value }: CalendarProviderProps) => {
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendarContext cần phải có provider bọc lại");
  }
  return ctx;
};