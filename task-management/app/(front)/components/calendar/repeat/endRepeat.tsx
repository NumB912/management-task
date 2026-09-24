import { Button } from "@/app/(front)/components/ui/button";
import { Calendar } from "@/app/(front)/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/(front)/components/ui/dropdown-menu";
import { formatSpecific } from "@/app/(front)/utils/getDayOfMonth.utils";
import { vi } from "date-fns/locale";
import dayjs from "dayjs";
import { Calendar1, ChevronDown, X } from "lucide-react";
import React, { useEffect, useState } from "react";
interface EndProp {
  selectedDate: Date;
  setEndDate: (endDate: Date | null) => void;
  endDate: Date | null;
  placeholder?:string,
  addTitleDate?:string
}
const End = ({ selectedDate, setEndDate, endDate,placeholder="",addTitleDate="" }: EndProp) => {
  const [month, setMonth] = useState<Date | null>(endDate);
  const [endDateTemp, setEndDateTemp] = useState<Date | null>(endDate);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setMonth(endDate);
  }, [endDate]);

  function onComfirm() {
    setEndDate(endDateTemp);
    setOpen(false);
  }

  function onClear() {
    if(endDate===endDateTemp){
      setEndDateTemp(null);
      setEndDate(null)
      setOpen(false);
      return 
    }

    setEndDateTemp(endDate);
    setOpen(false);
  }

  useEffect(() => {
    if (!endDate || selectedDate > endDate) {
      setEndDate(null);
      setEndDateTemp(null);
    }
  }, [selectedDate]);
  useEffect(() => {
    if (open) {
      setMonth(endDate ?? selectedDate);
    }
  }, [open]);

  return (
    <div className="relative w-full group">
          <DropdownMenu
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DropdownMenuTrigger
        className="w-full"
        asChild
        onClick={() => {
          setOpen((open) => !open);
        }}
      >
        <Button variant="outline" className="w-full justify-between rounded-sm!">
          <span className="flex gap-2 items-center">
            <Calendar1 />{" "}
            <p>{endDate ? `${addTitleDate} ${formatSpecific(endDate)}` : placeholder}</p>
          </span>
          <ChevronDown className="w-4 h-4 md:group-hover:opacity-0 opacity-100 md:opacity-100" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full z-60 h-full">
        <div className="flex gap-2 p-2 items-center justify-center border-b border-gray-300">
          <p className=" text-Center text-primary">Chọn dừng</p>
        </div>

        <Calendar
          locale={vi}
          required={true}
          selected={endDateTemp??undefined}
          mode="single"
          onSelect={setEndDateTemp}
          showOutsideDays
          month={month??undefined}
          onMonthChange={(newMonth) => {
            setMonth(newMonth);
          }}
          disabled={(date) => selectedDate > date}
          className="p-0 [--cell-size:--spacing(10)] m-0"
          modifiers={{
            inRange: (date) => date < selectedDate,
            endDate: (date) => {
              return dayjs(endDateTemp).isSame(date, "day");
            },
            startDate: (date) => {
              return dayjs(selectedDate).isSame(date, "day");
            },
          }}
          modifiersClassNames={{
            inRange: "text-gray-500",
            endDate:
              "bg-primary! hover:bg-primary! text-white! hover:text-white! rounded-r-full! border-0!",
            startDate:
              "bg-primary! hover:bg-primary! text-white hover:text-white rounded-l-full!",
          }}
          classNames={{
            day_button:
              "w-fit m-0.5 p-0 group-data-[focused=true]/day:ring-[1px] group-data-[focused=true]/day:ring-gray-200 !rounded-full cursor-pointer border-0!",
            today: "rounded-full text-primary bg-primary/10 ",
          }}
        />

        <div className="flex gap-2 w-full p-2">
          <Button
            className="flex-1 cursor-pointer"
            variant={"outline"}
            onClick={onClear}
          >
            Xóa
          </Button>
          <Button className="flex-1 cursor-pointer" onClick={onComfirm}>
            Xác nhận
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
          {endDate && (
        <button
          type="button"
          aria-label="Xóa ngày dừng lặp"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted
                     opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setEndDate(null);
            setEndDateTemp(null);
          }}
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};

export default End;
