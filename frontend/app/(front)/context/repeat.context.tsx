
import { createContext, useContext, ReactNode } from "react";
import { IRepeat } from "../model/rule/rule.model";

interface RepeatContextValue {
  repeat: IRepeat;
  setRepeat: (r: IRepeat) => void;
  selectedDate:Date|null,
  setSelectedDate:(date:Date)=>void;
  setSelectedEndDate:(date:Date|null)=>void;
  setDefaultRepeat:(defaultRepeat:IRepeat)=>void;
  defaultRepeat:IRepeat
}

const RepeatContext = createContext<RepeatContextValue | null>(null);

export const RepeatProvider = ({
  children,
  value,
}: { children: ReactNode; value: RepeatContextValue }) => {
  return <RepeatContext.Provider value={value}>{children}</RepeatContext.Provider>;
};

export const useRepeatContext = () => {
  const ctx = useContext(RepeatContext);
  if (!ctx) throw new Error("useRepeatContext cần Provider");
  return ctx;
};