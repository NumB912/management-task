"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Plus } from "lucide-react";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import MonthView from "../../components/calendar/evenCalendar/monthCalendar";
import { ViewMode } from "../../model/type/type";
import DayView from "../../components/calendar/evenCalendar/dayCalendar";
import WeekView from "../../components/calendar/evenCalendar/weekCalendar";
import { useWorkspaceStore } from "../../states/workspace.state";
import AppDrawer from "../../components/appDrawer.component";
import CreateEventForm from "../../components/calendar/newTaskDrawer.component";
import { ICreateTaskModel, IRuleModel } from "../../model";
import {useCreateTaskWithSectionObject } from "../../feature/hook/useTaskMutation.hook";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_COLORS } from "../../model/mod/color.config";
import { formatDate, formatDateVi } from "../../utils/getDayOfMonth.utils";

const Page = () => {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { inbox } = useWorkspaceStore();
  const listIndex = useWorkspaceStore(useShallow((state)=>state.listIndex))
  const [createOpen, setCreateOpen] = useState(false);
  const { mutate: createTask } = useCreateTaskWithSectionObject()
  const addTaskStore = useWorkspaceStore((state)=>state.addTask)
  const changeIdTaskStore = useWorkspaceStore((state)=>state.changeIdTask)
  const removeTaskStore = useWorkspaceStore((state)=>state.removeTask)
  const [ruleDefault, setRuleDefault] = useState<Omit<IRuleModel,"id"|"task">>({
    list: inbox ?? "",
    tags: [],
    repeat: {
      mode: "none",
    },
    color:DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    start_date: new Date(),
  });
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

  const viewLabel: Record<ViewMode, string> = {
    month: "Tháng",
    week: "Tuần",
    day: "Ngày",
  };

  const handleSaveEvent = (data: ICreateTaskModel) => {
    const idTemp = `temp-task-id-${crypto.randomUUID()}`
    const idRuleTemp =  `temp-rule-id-${crypto.randomUUID()}`
    addTaskStore({
      id: idTemp,
      children: [],
      list: data.list,
      name: data.name,
      rule: {
        id: idRuleTemp,
        task: idTemp,
        list:data.list,
        color:data.rule.color,
        end_date:data.rule.end_date,
        endTimer:data.rule.endTimer,
        priority:data.rule.priority,
        start_date:data.rule.start_date,
        timer:data.rule.timer,
        tags: data.rule.tags,
        repeat: data.rule.repeat
      },
      section: data.section,
      status: "pending"
    })
    createTask(data,{
      onSuccess(data, variables, onMutateResult, context) {
        changeIdTaskStore(idTemp,data.id)
      },
      onError(error, variables, onMutateResult, context) {
        removeTaskStore(idTemp)
      },
    })
    setCreateOpen(false);
  };

  const handleOpenCreatetask = (day: Date, timer?: number) => {
    setRuleDefault(prev=>({
      ...prev,
      timer:timer?timer!*60*60:undefined,
      start_date:day
    }))
    setCreateOpen(true)
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md"
            onClick={goToday}
          >
            Hôm nay
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
          <h1 className="text-lg font-bold text-foreground ml-1">{formatDateVi(new Date(currentDate!), "EEEE, dd 'tháng' MM 'năm' yyyy")}</h1>
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
              <DropdownMenuItem onClick={() => setView("day")}>
                Ngày
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("week")}>
                Tuần
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("month")}>
                Tháng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="rounded-md gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Tạo mới
          </Button>
        </div>
      </div>

      {view === "month" && <MonthView currentDate={currentDate} onCreateTask={handleOpenCreatetask}/> }
      {view === "week" && (
        <WeekView
          currentDate={currentDate}
          onCreateTask={handleOpenCreatetask}
        />
      )}
      {view === "day" && (
        <DayView
          currentDate={currentDate}
          onCreateTask={handleOpenCreatetask}
        />
      )}

      <AppDrawer open={createOpen} onOpenChange={setCreateOpen} hideHeader>
        <CreateEventForm
          onCancel={() => setCreateOpen(false)}
          onSave={handleSaveEvent}
          defaultValue={{
            list: inbox ?? "",
            name: "",
            rule: ruleDefault,
            section: listIndex[inbox!]?.sections[0]??"",
          }}
        />
      </AppDrawer>
    </div>
  );
};

export default Page;
