import { ITaskModel } from "@/app/(front)/model";
import { IColorModel } from "@/app/(front)/model/color.model";
import { HOURS } from "@/app/(front)/model/mod/mod";
import { formatTimer } from "@/app/(front)/utils/formatTimer";
import { occursOn } from "@/app/(front)/utils/task.visibility";
import { CalendarRange } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

interface HourGridProp {
  tasks: ITaskModel[];
  type: "Day" | "Week";
  days?: Date[];
  colors: Record<string, IColorModel>;
  onHandle: (day: Date, timer?: number) => void;
}

const HOUR_HEIGHT = 56;
const MIN_TASK_HEIGHT = 40;
const LINK = "/dashboard/tasks";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

type Positioned = { task: ITaskModel; top: number; height: number };
type Laid = Positioned & { lane: number; lanes: number };

const getTaskStyle = (
  task: ITaskModel,
  firstHour: number,
  lastHour: number,
) => {
  const rule = task.rule;
  if (rule?.timer == null) return null;

  const startSec: number = rule.timer;
  const gridEndSec = (lastHour + 1) * 3600;

  // Task qua nửa đêm (vd 22:00 → 01:00): kéo dài đến hết lưới thay vì bị âm chiều cao
  // Overnight task (e.g. 22:00 → 01:00): extend to the bottom of the grid instead of a negative height
  let endSec: number = rule.endTimer ?? startSec;
  if (endSec < startSec) endSec = gridEndSec;

  const top = (startSec / 3600 - firstHour) * HOUR_HEIGHT;
  const height = Math.max(
    ((endSec - startSec) / 3600) * HOUR_HEIGHT,
    MIN_TASK_HEIGHT,
  );
  return { top, height };
};

const layoutOverlaps = (items: Positioned[]): Laid[] => {
  const sorted = [...items].sort(
    (a, b) =>
      a.top - b.top ||
      b.height - a.height ||
      String(a.task.id).localeCompare(String(b.task.id)),
  );

  const result: Laid[] = [];
  let cluster: Laid[] = [];
  let clusterEnd = -Infinity;
  let laneEnds: number[] = [];

  const flush = () => {
    const lanes = Math.max(laneEnds.length, 1);
    cluster.forEach((c) => (c.lanes = lanes));
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
  };

  for (const it of sorted) {
    if (it.top >= clusterEnd) flush();

    let lane = laneEnds.findIndex((end) => end <= it.top);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = it.top + it.height;

    cluster.push({ ...it, lane, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, it.top + it.height);
  }
  flush();

  return result;
};

const HourGrid = ({
  tasks,
  type = "Day",
  days,
  onHandle,
  colors,
}: HourGridProp) => {
  const firstHour = HOURS[0];
  const lastHour = HOURS[HOURS.length - 1];
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  const columns: { date?: Date; tasks: ITaskModel[] }[] = useMemo(() => {
    const safeDays = days ?? [];
    if (type === "Day") {
      const date = safeDays[0];
      return [
        {
          date,
          tasks: date ? tasks.filter((t) => occursOn(t, date)) : tasks,
        },
      ];
    }

    return safeDays.map((date) => ({
      date,
      tasks: tasks.filter((t) => occursOn(t, date)),
    }));
  }, [tasks, type, days]);

  const columnLayouts = useMemo(
    () =>
      columns.map((col) =>
        layoutOverlaps(
          col.tasks.flatMap((task) => {
            const style = getTaskStyle(task, firstHour, lastHour);
            return style ? [{ task, ...style }] : [];
          }),
        ),
      ),
    [columns, firstHour, lastHour],
  );

  const gridColsClass =
    type === "Week" ? "grid-cols-[56px_repeat(7,1fr)]" : "grid-cols-[56px_1fr]";

  return (
    <div className="flex-1 overflow-y-auto min-h-0 h-full">
      <div className={`grid ${gridColsClass} relative`}>
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-t border-border/30 h-14">
              {hour === 0
                ? ""
                : `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "am" : "pm"}`}
            </div>
            {columns.map((col, colIdx) => (
              <div
                key={
                  col.date
                    ? `${col.date.toISOString()}-${hour}`
                    : `${colIdx}-${hour}`
                }
                onClick={() => {
                  if (col.date) onHandle(col.date, hour);
                }}
                className="border-t border-l border-border/30 h-14 hover:bg-muted/20 z-20 transition-colors cursor-pointer relative"
              />
            ))}
          </React.Fragment>
        ))}

        {columns.map((col, colIdx) => (
          <div
            key={col.date ? col.date.toISOString() : `day-${colIdx}`}
            className="absolute top-0 overflow-hidden pointer-events-none"
            style={{
              height: totalHeight,
              left:
                type === "Week"
                  ? `calc(56px + ${colIdx} * ((100% - 56px) / 7))`
                  : "56px",
              width:
                type === "Week"
                  ? "calc((100% - 56px) / 7)"
                  : "calc(100% - 56px)",
            }}
          >
            {columnLayouts[colIdx].map(
              ({ task, top, height, lane, lanes }, i) => {
                const time = task.rule?.timer;
                const endTime = task.rule?.endTimer;
                const isDone = task.status === "done";
                const short = height < 48;

                const isMultiDay = !!(
                  task.rule?.end_date || task.rule?.repeat?.until
                );
                // Ngày không phải ngày bắt đầu thì làm mờ để phân biệt
                // Fade blocks on days other than the start day
                const isStartDay =
                  !col.date ||
                  !task.rule?.start_date ||
                  isSameDay(col.date, new Date(task.rule.start_date));

                return (
                  <Link
                    key={`${task.id}-${i}`}
                    href={`${LINK}/${task.id}`}
                    title={task.name}
                    className={`absolute pointer-events-auto flex ${
                      short ? "flex-row items-center gap-1" : "flex-col gap-0.5"
                    } rounded-md border border-white px-2 py-1 text-[11px] overflow-hidden shadow-sm cursor-pointer z-30 ${
                      isDone ? "line-through text-black/60" : "text-white"
                    } ${isStartDay ? "" : "opacity-70"}`}
                    style={{
                      top,
                      height,
                      backgroundColor: colors[task.id]?.color ?? task.color,
                      left: `calc(${(lane / lanes) * 100}% + 1px)`,
                      width: `calc(${100 / lanes}% - 2px)`,
                    }}
                  >
                    <span className="font-medium truncate">{task.name}</span>

                    <span className="flex">
                      {time != null && (
                        <span className="font-medium truncate shrink-0 opacity-90">
                          {formatTimer(time)}
                        </span>
                      )}
                      {endTime != null && (
                        <span className="font-medium truncate shrink-0 opacity-90">
                          - {formatTimer(endTime)}
                        </span>
                      )}
                    </span>

                    {isMultiDay && (
                      <span className="font-medium truncate">
                        <CalendarRange className="w-3 h-3 shrink-0" />
                      </span>
                    )}
                  </Link>
                );
              },
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourGrid;