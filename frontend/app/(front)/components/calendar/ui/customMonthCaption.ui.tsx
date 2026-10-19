import { CalendarMonth, useDayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "@/app/(front)/components/ui/button";
import { ArrowLeftCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCaptionFull, formatDate } from "@/app/(front)/utils/getDayOfMonth.utils";
interface CustomMonthCaptionProp {
  calendarMonth: CalendarMonth;
  displayIndex: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const CustomMonthCaption = ({
  calendarMonth,
  displayIndex,
}: CustomMonthCaptionProp) => {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();

  return (
    <div className="flex gap-2 p-2 items-center justify-between">
      <span className="text-md">
        {formatCaptionFull(calendarMonth.date)}
      </span>
      <div className=" flex items-center gap-2">
        <Button
        onClick={()=>previousMonth && goToMonth(previousMonth)}
          className=" aspect-square p-2 cursor-pointer"
          variant={"outline"}
        >
          <ChevronLeft />
        </Button>

        <Button className="rounded-full aspect-square cursor-pointer text-sm" variant={"outline"} onClick={()=>goToMonth(new Date())}>Hôm nay</Button>

        <Button
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className=" aspect-square p-2 cursor-pointer"
          variant={"outline"}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};
export default CustomMonthCaption;
