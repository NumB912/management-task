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
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import AppDrawer from "../../components/appDrawer.component";
import CreateEventForm from "../../components/calendar/newTaskDrawer.component";
import { ICreateTaskModel, IRuleModel, ITaskModel } from "../../model";
import {useCreateTaskWithSectionObject } from "../../feature/hook/useTaskMutation.hook";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_COLORS } from "../../model/mod/color.config";
import {formatDateVi } from "../../utils/getDayOfMonth.utils";
import ObjectID from "bson-objectid";
import { useCalendarStore } from "../../feature/store/calendar/calendar.state";

const Page = () => {
  const {View,setView} = useCalendarStore()
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { inbox } = useWorkspaceStore();
  const listIndex = useWorkspaceStore(useShallow((state)=>state.listIndex))
  const [createOpen, setCreateOpen] = useState(false);
  const { mutate: createTask } = useCreateTaskWithSectionObject()
  const addTaskStore = useWorkspaceStore((state)=>state.addTask)
  const removeTaskStore = useWorkspaceStore((state)=>state.removeTask)
  const [ruleDefault, setRuleDefault] = useState<Omit<IRuleModel,"id"|"task">>({
    list: inbox ?? "",
    tags: [],
    repeat: {
      mode: "none",
    },
    start_date: new Date(),
  });
  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (View === "month") setCurrentDate((d) => subMonths(d, 1));
    if (View === "week") setCurrentDate((d) => subWeeks(d, 1));
    if (View === "day") setCurrentDate((d) => subDays(d, 1));
  };
  const goNext = () => {
    if (View === "month") setCurrentDate((d) => addMonths(d, 1));
    if (View === "week") setCurrentDate((d) => addWeeks(d, 1));
    if (View === "day") setCurrentDate((d) => addDays(d, 1));
  };

  const ViewLabel: Record<ViewMode, string> = {
    month: "Tháng",
    week: "Tuần",
    day: "Ngày",
  };

  const handleSaveEvent = (data: ICreateTaskModel) => {
    const idTemp = `${new ObjectID().toString()}`
    const idRuleTemp =  `${new ObjectID().toString()}`
    addTaskStore({
      id: idTemp,
      children: [],
      list: data.list,
      name: data.name,
      color:data.color,
      rule: {
        id: idRuleTemp,
        task: idTemp,
        list:data.list,
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
    createTask({
      ...data,
      id:idTemp,
      rule:{
        ...data.rule,
        id:idRuleTemp,
        task:idTemp
      }
    },{
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
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/50 px-3 py-3 sm:px-5 lg:px-6">
        <h1 className="w-full min-w-0 text-base font-bold text-foreground xl:order-2 xl:w-auto xl:flex-1 xl:px-2 xl:text-lg">
          <span className="sm:hidden">{formatDateVi(currentDate, "dd 'tháng' MM, yyyy")}</span>
          <span className="hidden sm:inline">{formatDateVi(currentDate, "EEEE, dd 'tháng' MM 'năm' yyyy")}</span>
        </h1>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3 xl:order-1">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-2.5 sm:px-3"
            onClick={goToday}
          >
            Hôm nay
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-md"
              onClick={goPrev}
              aria-label="Kỳ trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-md"
              onClick={goNext}
              aria-label="Kỳ tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:order-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-md gap-1" aria-label="Chế độ xem lịch">
                {ViewLabel[View]}
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
            className="h-10 min-w-10 rounded-md gap-1.5 px-2.5 sm:px-3"
            aria-label="Tạo nhiệm vụ mới"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo mới</span>
          </Button>
        </div>
      </div>

      {View === "week" && (
        <p className="shrink-0 border-b border-border/50 px-3 py-1.5 text-xs text-muted-foreground md:hidden">
          Vuốt ngang để xem các ngày trong tuần
        </p>
      )}
      {View === "month" && <MonthView currentDate={currentDate} onCreateTask={handleOpenCreatetask}/> }
      {View === "week" && (
        <WeekView
          currentDate={currentDate}
          onCreateTask={handleOpenCreatetask}
        />
      )}
      {View === "day" && (
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
            color:DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
          }}
        />
      </AppDrawer>
    </div>
  );
};

export default Page;
