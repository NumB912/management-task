"use client";

import React, { useMemo, useState } from "react";
import { IPomodoroModel } from "@/app/(front)/model/pomodoro.model";
import { daysAgo } from "@/app/(front)/feature/hook/pomodoro/usePomodoroStats";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { ChartColumn, Check, Ticket, Timer } from "lucide-react";
import { TaskStatsView } from "../components/task/taskStatsView";
import { TaskStatsItem } from "../feature/hook/task/useTaskStats";
// import { TaskStatsView } from "../components/task/taskStatsView";

const USE_MOCK = true;

function makeMockSessions(): IPomodoroModel[] {
  const result: unknown[] = [];
  const hours = [8, 10, 14, 16, 20];

  for (let day = 0; day < 14; day++) {
    const count = 2 + ((day * 7) % 4);
    for (let i = 0; i < count; i++) {
      const start = daysAgo(day, hours[i % hours.length], (i * 7) % 40);
      const hasPause = (day + i) % 3 === 0;
      const progress = hasPause
        ? [
            { startPause: start, duration: 12 * 60_000 },
            {
              startPause: new Date(start.getTime() + 15 * 60_000),
              duration: 13 * 60_000,
            },
          ]
        : [{ startPause: start, duration: 25 * 60_000 }];

      result.push({
        id: `mock-${day}-${i}`,
        start,
        progress,
        task: { id: `task-${i}`, name: `Công việc ${i + 1}` },
      });
    }
  }
  return result as IPomodoroModel[];
}

function makeMockTasks(): TaskStatsItem[] {
  return Array.from({ length: 40 }, (_, i) => {
    const completed = i % 3 !== 0;
    return {
      id: `t-${i}`,
      completed,
      createdAt: daysAgo(10 + (i % 8), 9),
      completedAt: completed ? daysAgo(i % 12, 11 + (i % 6)) : null,
      dueDate: daysAgo((i % 7) - 2, 17),
      priority: ((i % 4) + 1) as TaskPriority,
    };
  });
}

type StatsSection = "task" | "pomodoro";

export default function StatsPage() {
  const [section, setSection] = useState<StatsSection>("task");
  const sessions = useMemo<IPomodoroModel[]>(
    () => (USE_MOCK ? makeMockSessions() : []),
    [],
  );
  const tasks = useMemo<TaskStatsItem[]>(
    () => (USE_MOCK ? makeMockTasks() : []),
    [],
  );

  return (
    <div className="flex max-h-dvh w-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="title flex text-xl font-bold text-nowrap gap-2">
        <ChartColumn /> Thống kê nhiệm vụ
      </div>
      <div className="flex items-center justify-center">
        <ToggleGroup
          type="single"
          value={section}
          onValueChange={(v) => {
            if (v) setSection(v as StatsSection);
          }}
          className="flex max-w-md! w-full justify-center gap-1 rounded-full bg-accent/75 p-1"
        >
          <ToggleGroupItem
            value="task"
            className="flex-1 rounded-full font-bold text-neutral-600 data-[state=on]:bg-white"
          >
            <Check  className={`${section=="task"&&"text-primary"}`}/> Nhiệm vụ
          </ToggleGroupItem>
          <ToggleGroupItem
            value="pomodoro"
            className="flex-1 rounded-full font-bold text-neutral-600 data-[state=on]:bg-white"
          >
            <Timer className={`${section=="pomodoro"&&"text-primary"}`}/>
            Pomodoro
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {section === "task" ? (
        <TaskStatsView tasks={tasks} />
      ) : (
        // <PomodoroStatsView sessions={sessions} />
        <></>
      )}
    </div>
  );
}
