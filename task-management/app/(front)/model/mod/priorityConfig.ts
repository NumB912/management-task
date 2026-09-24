export const PRIORITY_COLORS: Record<number, string> = {
  1: "text-red-500!",
  2: "text-orange-500!",
  3: "text-blue-500!",
  4: "text-gray-400!",
};

export const PRIORITY_BORDER: Record<number, string> = {
  1: "border-red-500!",
  2: "border-orange-500!",
  3: "border-blue-500!",
  4: "border-gray-400!",
};

export const PRIORITY_CONFIG = [
  { value: 1, label: "Ưu tiên 1", colorClass: "text-red-500 fill-red-500" },
  { value: 2, label: "Ưu tiên 2", colorClass: "text-orange-500 fill-orange-500" },
  { value: 3, label: "Ưu tiên 3", colorClass: "text-blue-500 fill-blue-500" },
  { value: 4, label: "Ưu tiên 4", colorClass: "text-gray-500 fill-gray-500" },
] as const;

export const PRIORITY_LABEL: Record<number, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};