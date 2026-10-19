export function compareDate(
  dateStart?: Date | string | null,
  dateEnd?: Date | string | null
): boolean {
  if (!dateStart || !dateEnd) return false;

  const start = dateStart instanceof Date ? dateStart : new Date(dateStart);
  const end = dateEnd instanceof Date ? dateEnd : new Date(dateEnd);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  return start.getTime() <= end.getTime();
}