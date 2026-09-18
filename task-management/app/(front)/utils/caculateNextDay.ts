import { IRepeat } from "@/app/core/domain";
import dayjs from "dayjs";


export const calculateNextDate = (repeat: IRepeat, fromDate: Date): Date | null => {
  const base = dayjs(fromDate);
  const every = repeat.every ?? 1;

  switch (repeat.mode) {
    case "none":
      return null;
    case "day":
      return base.add(every, "day").toDate();
    case "week": {
      if (!repeat.days || repeat.days.length === 0) {
        return base.add(every, "week").toDate();
      }

      const sortedDays = [...repeat.days].sort((a, b) => a - b);
      const currentDayOfWeek = base.day(); 

      const nextDayThisWeek = sortedDays.find((d) => d > currentDayOfWeek);

      if (nextDayThisWeek !== undefined) {
        return base.add(nextDayThisWeek - currentDayOfWeek, "day").toDate();
      }
      const daysUntilNextCycle = (every - 1) * 7 + (7 - currentDayOfWeek + sortedDays[0]);
      return base.add(daysUntilNextCycle, "day").toDate();
    }

    // Lặp mỗi N tháng, có thể chỉ định ngày cụ thể trong tháng (dates: [1,15,30])
    case "month": {
      // ⚠️ Nếu không chọn ngày cụ thể -> lặp lại đúng N tháng sau, cùng ngày trong tháng
      if (!repeat.dates || repeat.dates.length === 0) {
        return base.add(every, "month").toDate();
      }

      const sortedDates = [...repeat.dates].sort((a, b) => a - b);
      const currentDay = base.date();

      const nextDateThisMonth = sortedDates.find((d) => d > currentDay);

      if (nextDateThisMonth) {
        return base.date(nextDateThisMonth).toDate();
      }

      // hết ngày trong tháng này -> nhảy every tháng tiếp theo, lấy ngày nhỏ nhất
      return base.add(every, "month").date(sortedDates[0]).toDate();
    }

    // Lặp theo danh sách ngày cố định cụ thể (specificDays: Date[])
    case "specific": {
      if (!repeat.specificDays || repeat.specificDays.length === 0) return null;

      const sorted = [...repeat.specificDays]
        .map((d) => dayjs(d))
        .sort((a, b) => a.valueOf() - b.valueOf());

      const next = sorted.find((d) => d.isAfter(base));
      return next ? next.toDate() : null; 
    }

    default:
      return null;
  }
};