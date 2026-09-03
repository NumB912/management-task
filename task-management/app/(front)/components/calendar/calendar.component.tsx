import React, { useEffect, useMemo, useRef } from "react";
import { Calendar } from "@/app/(front)/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(front)/components/ui/select";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/app/(front)/components/ui/dropdown-menu";
import CustomMonthCaption from "./ui/customMonthCaption.ui";
import { Button } from "@/app/(front)/components/ui/button";
import Repeat from "./repeat/Repeat";
import { useCalendar } from "@/app/(front)/hooks/useCalendar.hook";
import { IRepeat, IRuleModel } from "@/app/(front)/model/rule/rule.model";
import EndDate from "./end-date/endDate.component";
import { normalizeDate } from "@/app/(front)/utils/getDayOfMonth.utils";
import { RepeatProvider } from "../../context/repeat.context";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar1, Clock, Sunrise } from "lucide-react";
import { vi } from "date-fns/locale";
import dayjs from "dayjs";
import { TIME_OPTIONS } from "../../utils/timeOption.utils";

interface CalendarProp {
  trigger: React.ReactNode;
  rule: Pick<IRuleModel, "repeat" | "timer" | "end_date" | "start_date"|"priority">;
  onChangeSubmit: (
    rule: Pick<IRuleModel, "repeat" | "timer" | "end_date" | "start_date">,
  ) => void;
}

const defaultRepeat: IRepeat = {
  mode: "none",
};

const factoryCalendar = (repeat: IRepeat, startDate: Date, date: Date) => {
  switch (repeat.mode) {
    case "day": {
      const diffDays = Math.round(
        (startDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays % (repeat.every || 1) == 0;
    }
    case "week": {
      const day = date.getDay();
      const sun = new Date(date);
      sun.setDate(sun.getDate() + ((7 - day) % 7));
      const mon = new Date(sun);
      mon.setDate(mon.getDate() - 6);
      const startDay = startDate.getDay();
      const startmon = new Date(startDate);
      startmon.setDate(startmon.getDate() - startDay);
      startmon.setHours(0, 0, 0, 0);

      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const weekIndex = Math.round(
        (mon.getTime() - startmon.getTime()) / weekMs,
      );

      return (
        (repeat.days || []).includes(date.getDay()) &&
        mon.getTime() <= date.getTime() &&
        sun.getTime() >= date.getTime() &&
        weekIndex % (repeat.every || 1) === 0
      );
    }
    case "month":
      return (
        (repeat.dates || []).includes(date.getDate()) &&
        (startDate.getMonth() + date.getMonth()) % (repeat.every || 1) == 0
      );
    case "none":
      return false;
    case "specific":
      return (repeat.specificDays || []).some(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate(),
      );
  }
};

const CalendarComponent = ({ trigger, rule, onChangeSubmit }: CalendarProp) => {
  const {
    isOpen,
    setSelectedDate,
    selectedDate,
    chooseNextWeek,
    setIsOpen,
    chooseToday,
    setIsEndRepeat,
    setMonth,
    month,
    setRepeat,
    year,
    setTimer,
    timer,
    setYear,
    repeat,
    selectedEndDate,
    setSelectedEndDate,
    setDefaultRepeat,
    defaultRepeat,
    chooseTomorrow,
  } = useCalendar({
    selectedDate: rule?.start_date
      ? new Date(rule.start_date)
      : normalizeDate(new Date()),
    defaultRepeat: rule.repeat,
    repeat: rule.repeat,
    selectedEndDate: rule.end_date,
  });

  useEffect(() => {
    setDefaultRepeat(
      rule.repeat ?? {
        mode: "none",
        every: 0,
      },
    );
    setRepeat(
      rule.repeat ?? {
        mode: "none",
        every: 0,
      },
    );
    setTimer(rule.timer ?? undefined);
    setSelectedDate(
      rule?.start_date ? new Date(rule.start_date) : normalizeDate(new Date()),
    );
    setSelectedEndDate(rule?.end_date ? new Date(rule.end_date) : null);
  }, [rule]);

  useEffect(() => {
    if (isOpen) {
      setRepeat(defaultRepeat);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  const handleClear = () => {
    onChangeSubmit({
      repeat: defaultRepeat,
      end_date: null,
      start_date: null,
      timer: null,
    });
   setIsOpen(false);
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open === false) {
          setDefaultRepeat(
            rule.repeat ?? {
              mode: "none",
              every: 0,
            },
          );
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        style={{ zIndex: 10 }}
        className={cn("p-0!")}
        onClick={(e) => e.stopPropagation()}
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ zIndex: 60 }} className="w-full">
        <div className="p-2 text-sm">
          <div className="flex flex-col gap-1 py-3 border-gray-200">
            <div
              onClick={chooseToday}
              className={cn(
                "flex gap-2 items-center border border-gray-200 hover:bg-neutral-300 px-2 py-2 rounded cursor-pointer",
              )}
            >
              <Calendar1 className="w-5 h-5" />
              <p>Hôm nay</p>
            </div>

            <div
              onClick={chooseTomorrow}
              className="flex gap-2 items-center border border-gray-200 hover:bg-gray-300 px-2 py-2 rounded cursor-pointer"
            >
              <Sunrise className="w-5 h-5" />
              <p>Ngày mai</p>
            </div>
            <div
              onClick={chooseNextWeek}
              className="flex gap-2 items-center border border-gray-200 hover:bg-gray-300 px-2 py-2 rounded cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
              <p>Tuần sau</p>
            </div>
          </div>
          <Calendar
            locale={vi}
            required={true}
            selected={selectedDate ?? new Date()}
            mode="single"
            onSelect={setSelectedDate}
            weekStartsOn={1}
            showOutsideDays
            month={new Date(year, month)}
            onMonthChange={(month) => {
              setMonth(month.getMonth());
              setYear(month.getFullYear());
            }}
            className={cn("p-0 [--cell-size:--spacing(10)] w-full")}
            modifiers={{
              endDate: (date) => {
                return dayjs(selectedEndDate).isSame(date, "day");
              },
              startDate: (date) => {
                return (
                  dayjs(selectedDate).isSame(date, "day") && !!selectedEndDate
                );
              },
              notInRange: (date) =>
                date <= selectedDate! ||
                date.getTime() < Date.now() ||
                !selectedEndDate ||
                selectedEndDate <= date,
              InRange: (date) => date > selectedDate!,
              Repeat: (date) => {
                if (
                  date.getTime() <=
                    Math.max(selectedDate!.getTime(), Date.now()) ||
                  !repeat.every
                )
                  return false;
                const d1 = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                );

                const d2 = new Date(
                  selectedDate!.getFullYear(),
                  selectedDate!.getMonth(),
                  selectedDate!.getDate(),
                );

                return (
                  factoryCalendar(repeat, d2, d1) &&
                  (!selectedEndDate || date < selectedEndDate)
                );
              },

              selectedDateLessToday: (date) =>
                selectedDate!.getTime() < Date.now() &&
                dayjs(date).isSame(dayjs(), "day"),
            }}
            modifiersClassNames={{
              notInRange: "text-gray-500",
              Repeat: "bg-primary/20 rounded w-fit",
              endDate:
                "bg-primary! hover:bg-primary! text-white! hover:text-white! rounded-r-full!",
              startDate:
                "bg-primary! hover:bg-primary! text-white hover:text-white rounded-l-full!",
            }}
            classNames={{
              day: "m-0.5",
              day_button:
                "w-fit p-2 group-data-[focused=true]/day:ring-[1px] group-data-[focused=true]/day:ring-gray-200 !rounded-full cursor-pointer",
              today: "rounded-full! text-primary! bg-primary/10!",
            }}
            components={{
              MonthCaption: CustomMonthCaption,
              Nav(props) {
                return <></>;
              },
            }}
          />

          <div className="w-full grid grid-cols-1 py-2 gap-2 justify-center items-center border-gray-200">
            <Select value={rule.timer ?? undefined}>
              <SelectTrigger className={cn("w-full flex items-center gap-2")}>
                <div className="flex gap-2 items-center">
                  <Clock className="w-5 h-5" />
                  <SelectValue placeholder={"Thời gian bắt đầu"} />
                </div>
              </SelectTrigger>
              <SelectContent
                style={{ zIndex: 70 }}
                className={cn("max-h-50 overflow-y-auto")}
              >
                <SelectGroup>
                  {TIME_OPTIONS.map((timer) => (
                    <SelectItem
                      key={timer}
                      value={timer??""}
                      onClick={() => {
                        setTimer(timer);
                      }}
                    >
                      {timer}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <RepeatProvider
              value={{
                setRepeat,
                selectedDate,
                setDefaultRepeat,
                defaultRepeat,
                repeat,
                setSelectedDate,
              }}
            >
              <Repeat />
            </RepeatProvider>
            <EndDate
              endDate={selectedEndDate}
              selectedDate={selectedDate ?? new Date()}
              setEndDate={setSelectedEndDate}
            />
          </div>

          <div className="flex gap-2 w-full">
            <Button
              className="flex-1 cursor-pointer"
              variant={"outline"}
              onClick={handleClear}
            >
              Xóa
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              onClick={() => {
                onChangeSubmit({
                  ...rule,
                  end_date: selectedEndDate,
                  repeat: repeat,
                  start_date: selectedDate,
                  timer: timer,
                });
                setIsOpen(false);
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default CalendarComponent;
