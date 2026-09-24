import { useReducer } from "react";
import { getDayForRender } from "../utils/getDayOfMonth.utils";
import {
  DEFAULT_REPEAT_CONFIG,
} from "../components/calendar/repeat/repeat.types";
import { IRepeat } from "../model/rule/rule.model";
interface Days {
  year: number;
  month: number;
  days: {
    date: string;
    day: number;
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    label: string;
    isToday: boolean;
  }[];
}

interface CalendarState {
  isOpen: boolean;
  isEndRepeat: boolean;
  selectedDate: Date|null;
  selectedEndDate:Date|null;
  month: number;
  year: number;
  days: Days;
  repeat: IRepeat;
  defaultRepeat:IRepeat;
  timer?:number|null
  endTimer?:number|null
}

type CalendarAction =
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "SET_IS_END_REPEAT"; payload: boolean }
  | { type: "SET_SELECTED_DATE"; payload: Date|null }
  | {type: "SET_SELECTED_END_DATE";payload:Date|null}
  | { type: "SET_MONTH"; payload: number }
  | { type: "SET_YEAR"; payload: number }
  | { type: "SET_DAYS"; payload: Days }
  | { type: "SET_REPEAT"; payload: IRepeat }
  | { type: "SET_DEFAULT_REPEAT"; payload: IRepeat }
  | { type: "NEXT_MONTH" }
  | { type: "PREV_MONTH" }
  | { type: "TODAY" }
  | { type: "CHOOSE_TODAY" }
  | { type: "CHOOSE_NEXT_WEEK" }
  | { type: "SET_TIMER"; payload?: number }
  | {type: "SET_ENDTIMER"; payload?: number}
  | {type:"CHOOSE_TOMORROW"};

const initialState: CalendarState = {
  isOpen: false,
  isEndRepeat: false,
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  selectedDate: null,
  timer:undefined,
  endTimer:undefined,
  days: getDayForRender(new Date().getFullYear(), new Date().getMonth() + 1),
  repeat: DEFAULT_REPEAT_CONFIG,
  defaultRepeat: DEFAULT_REPEAT_CONFIG,
  selectedEndDate:null
};


const calendarReducer = (
  state: CalendarState,
  action: CalendarAction
): CalendarState => {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, isOpen: action.payload };

    case "SET_IS_END_REPEAT":
      return { ...state, isEndRepeat: action.payload };

    case "SET_SELECTED_DATE": {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return { ...state, selectedDate: action.payload };
    }


    case "SET_SELECTED_END_DATE": {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (action.payload && action.payload.getTime() < now.getTime()) return state;
      return { ...state, selectedEndDate: action.payload };
    }
    case "SET_MONTH":
      return { ...state, month: action.payload };

    case "SET_YEAR":
      return { ...state, year: action.payload };

    case "SET_DAYS":
      return { ...state, days: action.payload };

    case "SET_REPEAT":
      return { ...state, repeat: action.payload };

    case "SET_DEFAULT_REPEAT":
      return { ...state, defaultRepeat: action.payload };

    case "SET_TIMER":
      return { ...state, timer: action.payload };
    case "SET_ENDTIMER":
      return { ...state, endTimer: action.payload };
    case "NEXT_MONTH": {
      const nextM = (state.month + 1) % 12;
      const nextY = nextM === 0 ? state.year + 1 : state.year;
      return { ...state, month: nextM, year: nextY };
    }

    case "PREV_MONTH": {
      const d = new Date(state.year, state.month - 1);
      return { ...state, month: d.getMonth(), year: d.getFullYear() };
    }

    case "TODAY": {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return { ...state, month: d.getMonth() };
    }

    case "CHOOSE_TODAY": {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return {
        ...state,
        month: d.getMonth(),
        year: d.getFullYear(),
        selectedDate: d,
      };
    }
    case "CHOOSE_TOMORROW":
        { const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
      return {
        ...state,selectedDate:tomorrow
      } }
      

    case "CHOOSE_NEXT_WEEK": {
      const d = new Date(state.selectedDate!);
      d.setDate(d.getDate() + 7);
      return { ...state, selectedDate: d };
    }

    default:
      return state;
  }
};


export const useCalendar = (init:Partial<CalendarState>) => {
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    ...init
  });
  return {
    ...state,
    setIsOpen: (v: boolean) => dispatch({ type: "SET_OPEN", payload: v }),
    setIsEndRepeat: (v: boolean) => dispatch({ type: "SET_IS_END_REPEAT", payload: v }),
    setSelectedDate: (d: Date|null) => dispatch({ type: "SET_SELECTED_DATE", payload: d }),
    setSelectedEndDate:(d:Date|null)=>dispatch({type:"SET_SELECTED_END_DATE",payload:d}),
    setMonth: (m: number) => dispatch({ type: "SET_MONTH", payload: m }),
    setYear: (y: number) => dispatch({ type: "SET_YEAR", payload: y }),
    setDays: (d: Days) => dispatch({ type: "SET_DAYS", payload: d }),
    setRepeat: (r: IRepeat) => dispatch({ type: "SET_REPEAT", payload: r }),
    setTimer:(r?:number)=>dispatch({type:"SET_TIMER",payload:r}),
    setEndTimer:(r?:number)=>dispatch({type:"SET_ENDTIMER",payload:r}),
    setDefaultRepeat: (r: IRepeat) => dispatch({ type: "SET_DEFAULT_REPEAT", payload: r }),
    nextMonth: () => dispatch({ type: "NEXT_MONTH" }),
    prevMonth: () => dispatch({ type: "PREV_MONTH" }),
    today: () => dispatch({ type: "TODAY" }),
    chooseToday: () => dispatch({ type: "CHOOSE_TODAY" }),
    chooseNextWeek: () => dispatch({ type: "CHOOSE_NEXT_WEEK" }),
    chooseTomorrow: ()=>dispatch({type:"CHOOSE_TOMORROW"})
  };
};