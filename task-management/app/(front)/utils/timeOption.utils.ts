
import { ITime } from "../model/type/type";

export const TIME_OPTIONS: ITime[] = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = String((i % 2) * 30).padStart(2, "0");
  return `${h}:${m}` as ITime;
});