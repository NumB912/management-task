// import { create } from "zustand";
// import { getDayForRender } from "../utils/getDayOfMonth.utils";
// import { DEFAULT_REPEAT_CONFIG } from "../components/calendar/repeat/repeat.types";

// interface Days {
//   year: number;
//   month: number;
//   days: {
//     date: string;
//     day: number;
//     dayOfWeek: 0 | 2 | 1 | 3 | 4 | 5 | 6;
//     label: string;
//     isToday: boolean;
//   }[];
// }

// interface useCalendarState {
//   isOpen: boolean;
//   isEndRepeat: boolean;
//   selectedDate: Date;
//   month: number;
//   year: number;
//   days: Days;
//   repeat:Partial<RepeatConfig>;
//   defaultRepeat:Partial<RepeatConfig>;

//   setRepeat:(repeat: Partial<RepeatConfig>)=>void;
//   setDefaultRepeat:(repeat: Partial<RepeatConfig>)=>void;
//   setIsOpen: (open: boolean) => void;
//   setSelectedDate: (date: Date) => void;
//   setIsEndRepeat: (isEndRepeat: boolean) => void;
//   setMonth: (month: number) => void;
//   setYear: (year: number) => void;
//   setDays: (days: Days) => void;

//   chooseNextWeek: () => void;
//   chooseToday: () => void;
//   nextMonth: () => void;
//   prevMonth: () => void;
//   today: () => void;
// }
// const useCalendar = create<useCalendarState>((set, get) => ({
//   isOpen: false,
//   isEndRepeat: false,
//   month: new Date().getMonth(),
//   year: new Date().getFullYear(),
//   selectedDate: new Date(),
//   days: getDayForRender(new Date().getFullYear(), new Date().getMonth() + 1),
//   repeat:DEFAULT_REPEAT_CONFIG,
//   defaultRepeat:DEFAULT_REPEAT_CONFIG,

//   setDefaultRepeat(repeat) {
//     set(()=>({defaultRepeat:repeat}))
//   },

//   setRepeat(repeat) {
//     set(()=>({repeat:repeat}))
//   },

//   setMonth(month) {
//     set(() => ({ month: month }));
//   },
//   setIsEndRepeat(isEndRepeat) {
//     set(() => ({ isEndRepeat: isEndRepeat }));
//   },

//   setIsOpen(open) {
//     set(() => ({ isOpen: open }));
//   },

//   setSelectedDate(date) {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);

//     if (date.getTime() < d.getTime()) {
//       return;
//     }

//     set(() => ({ selectedDate: date }));
//   },
//   setYear(year) {
//     set(() => ({ year: year }));
//   },
//   setDays(days) {
//     set({ days: days });
//   },

//   nextMonth() {
//     const { month, year } = get();
//     const nextM = (month + 1) % 12;
//     const nextY = nextM === 0 ? year + 1 : year;
//     set({ month: nextM, year: nextY });
//   },
//   prevMonth() {
//     const { month, year } = get();
//     const d = new Date(year, month - 1);
//     set({
//       month: d.getMonth(),
//       year: d.getFullYear(),
//     });
//   },
//   today() {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);
//     set({ month: d.getMonth() });
//   },

//   chooseNextWeek() {
//     const { selectedDate } = get();
//     const d = new Date(selectedDate);
//     d.setDate(d.getDate() + 7);
//     set({ selectedDate: d });
//   },
//   chooseToday() {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);
//     set({
//       month: d.getMonth(),
//       year: d.getFullYear(),
//       selectedDate: d,
//     });
//   },
// }));

// export default useCalendar;
