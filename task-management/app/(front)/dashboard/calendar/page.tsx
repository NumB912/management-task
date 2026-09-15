"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import MonthView from "../../components/calendar/evenCalendar/monthCalendar";
import { ViewMode } from "../../model/type/type";
import DayView from "../../components/calendar/evenCalendar/dayCalendar";
import WeekView from "../../components/calendar/evenCalendar/weekCalendar";
import { useWorkspaceStore } from "../../states/workspace.state";

const Page = () => {
  const [view, setView] = useState<ViewMode>("month");
  const {listInfo} = useWorkspaceStore()
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
    if (view === "day") setCurrentDate((d) => subDays(d, 1));
  };
  const goNext = () => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    if (view === "day") setCurrentDate((d) => addDays(d, 1));
  };
  const title = useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      const sameMonth = isSameMonth(start, end);
      return sameMonth
        ? `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`
        : `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [view, currentDate]);

  const viewLabel: Record<ViewMode, string> = {
    month: "Month",
    week: "Week",
    day: "Day",
  };
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-md" onClick={goToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={goPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={goNext}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-lg font-bold text-foreground ml-1">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-md gap-1">
                {viewLabel[view]}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView("day")}>Day</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("week")}>Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("month")}>Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="rounded-md gap-1.5">
            <Plus className="w-4 h-4" />
            New event
          </Button>
        </div>
      </div>

      {view === "month" && <MonthView currentDate={currentDate} />}
      {view === "week" && <WeekView currentDate={currentDate} />}
      {view === "day" && <DayView currentDate={currentDate} />}
    </div>
  );
};

export default Page;