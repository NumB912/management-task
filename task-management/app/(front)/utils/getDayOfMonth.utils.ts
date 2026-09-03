import dayjs from "dayjs"
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi"
dayjs.locale("vi")
dayjs.extend(isSameOrBefore)
dayjs.extend(isoWeek);
export function getDaysInMonth(year: number, month: number) {
  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(`${year}-${month}-${i + 1}`)
    return {
      date: date.format("YYYY-MM-DD"),
      day: date.date(),         
      dayOfWeek: date.day(),     
      label: date.format("ddd"),  
      isToday: date.isSame(dayjs(), "day"),
    }
  })
}
export const normalizeDate = (d: Date): Date => {
  const clone = new Date(d)
  clone.setHours(0, 0, 0, 0)
  return clone
}

export function getDayForRender(year:number,month:number){
  const dates = getDaysInMonth(year,month)
  const startDate = dates[0]
  const endDate = dates[dates.length-1]
  const startDayOfWeek = startDate.dayOfWeek
  const endDayOfWeek = endDate.dayOfWeek
  const prevDate = dayjs(`${year}-${month}-${1}`).subtract(startDayOfWeek,'day').format("YYYY-MM-DD")
  const nextDate = dayjs(`${year}-${month}-${endDate.day}`).add(6-endDayOfWeek,'day').format("YYYY-MM-DD")
  return {
    year:year,
    month:month,
    days:getDaysInRange(prevDate,nextDate)
  }
}

export function getDaysInRange(from: string, to: string) {
  const days = []
  let current = dayjs(from)
  const end = dayjs(to)

  while (current.isSameOrBefore(end, "day")) {
    days.push({
      date: current.format("YYYY-MM-DD"),
      day: current.date(),
      dayOfWeek: current.day(),
      label: current.format("ddd"),
      isToday: current.isSame(dayjs(), "day"),
    })
    current = current.add(1, "day")
  }

  return days
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(from: Date): string {
  const target = dayjs(from);
  const now = dayjs();

  const isSameWeek = target.isSame(now, "isoWeek");
  const isSameMonth = target.isSame(now, "month");
  const isToday = target.isSame(now, "day");
  const isTomorrow =target.isSame(now.add(1,"day"),"day")
  if(isToday){
    return "Hôm nay";
  }

  if(isTomorrow){
    return "Ngày mai";
  } 

  if (isSameWeek) {
    return capitalizeFirst(target.locale("vi").format("dddd"));
  }

  if (isSameMonth) {
    return target.format("DD/MM");
  }

  return target.format("DD/MM/YYYY");
}
export function formatSpecific(from: Date): string {
  const target = dayjs(from);
  return target.format("DD/MM/YYYY");
}

export const formatCaptionFull = (date: Date) => dayjs(date).format("MMMM YYYY")