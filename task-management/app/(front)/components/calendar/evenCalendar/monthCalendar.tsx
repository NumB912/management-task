import { WEEKDAYS } from "@/app/(front)/model/mod/mod";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { useMemo } from "react";


function MonthView({ currentDate }: Readonly<{ currentDate: Date }>) {
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [currentDate]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-border/50 shrink-0">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

  <div className="flex-1 flex flex-col">
  {weeks.map((week, wIdx) => (
    <div
      key={wIdx}
      className="grid grid-cols-7 border-b border-border/50 last:border-b-0 h-full"
    >
      {week.map((day) => {
        const inCurrentMonth = isSameMonth(day, currentDate);
        const today = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className="border-r border-border/50 last:border-r-0 p-2 flex flex-col gap-1 min-h-25 hover:bg-muted/20 transition-colors cursor-pointer"
          >
            <span
              className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                today
                  ? "bg-foreground text-background font-bold"
                  : inCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground/40"
              }`}
            >
              {format(day, "d")}
            </span>
          </div>
        );
      })}
    </div>
  ))}
</div>
    </div>
  );
}


export default MonthView