import { ToggleGroup, ToggleGroupItem } from "@/app/(front)/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { WEEKDAYS } from "./repeat.types";

interface WeekdayPickerProps {
  selected: number[];
  onSelect: (days: number[]) => void;
}

const WeekdayPicker = ({ selected, onSelect }: WeekdayPickerProps) => {
  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      value={selected.map(String) as string[]}
      onValueChange={(v: string[]) => onSelect(v.map(Number))}
    >
      {WEEKDAYS.map(({ value, label }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className={cn(
            "rounded-full border cursor-pointer aspect-square",
            "data-[state=on]:bg-primary/50",
            "data-[state=on]:text-white",
            "data-[state=on]:border-transparent",
            "hover:bg-gray-100 border-none ",
          )}
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default WeekdayPicker;
