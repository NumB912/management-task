import { RepeatModePresent } from "@/app/(front)/model/rule/repeat.enum";
import { IRepeat } from "@/app/(front)/model/rule/rule.model";

export const DEFAULT_REPEAT_CONFIG: IRepeat = {
  mode:RepeatModePresent.None,
};

export const WEEKDAYS = [
  { value: "1", label: "H" },
  { value: "2", label: "B" },
  { value: "3", label: "T" },
  { value: "4", label: "N" },
  { value: "5", label: "S" },
  { value: "6", label: "BA" },
  { value: '0', label: "CN" },
] as const;

export const REPEAT_PRESETS = [
  { value: "daily", label: "Mỗi ngày" },
  { value: "weekly", label: "Mỗi tuần" },
  { value: "monthly", label: "Mỗi tháng" },
  { value: "custom", label: "Tùy chỉnh" },
] as const;

export const REPEAT_MODES = [
  { value: "repeat", label: "Theo lặp lại" },
  { value: "specific", label: "Theo ngày cụ thể" },
] as const;

export const REPEAT_UNITS = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
] as const;
