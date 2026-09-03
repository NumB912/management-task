import { Calendar } from "@/app/(front)/components/ui/calendar";
import { Button } from "@/app/(front)/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(front)/components/ui/select";
import { REPEAT_MODES } from "./repeat.types";
import RepeatByInterval from "./RepeatByInterval";
import { RepeatType, Unit } from "@/app/(front)/model/rule/repeat.enum";
import { IRepeat } from "@/app/(front)/model/rule/rule.model"
import { vi } from "date-fns/locale";
interface CustomRepeatPanelProps {
  config: IRepeat;
  repeatType: RepeatType;
  unit: Unit;
  selectedDate: Date;
  setUnit: (unit: Unit) => void;
  setRepeatType: (repeatType: RepeatType) => void;
  onChange: (patch:IRepeat) => void;
  onConfirm: () => void;
  onClear: () => void;
}
const CustomRepeatPanel = ({
  config,
  repeatType,
  unit,
  selectedDate,
  setRepeatType,
  onChange,
  onConfirm,
  onClear,
  setUnit,
}: CustomRepeatPanelProps) => {

  return (
    <div className="min-w-58 cursor-pointer">
      <div className="flex flex-col gap-3 p-2">
        <Select
          value={repeatType}
          onValueChange={(value) => setRepeatType(value as RepeatType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ zIndex: 9999 }}>
            <SelectGroup className="bg-white">
              {REPEAT_MODES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div>
          {repeatType === RepeatType.Repeat ? (
            <RepeatByInterval
              selectedDate={selectedDate}
              setUnit={setUnit}
              unit={unit}
              config={config}
              onChange={onChange}
            />
          ) : (
            <div className="w-full flex mt-2">
              <Calendar
                locale={vi}
                mode="multiple"
                selected={config.specificDays}
                modifiers={{
                  inRange: (date) => date < new Date(),
                }}
                disabled={(date)=>date < new Date()}
                showOutsideDays
                modifiersClassNames={{
                  inRange: "text-gray-500",
                }}
                onSelect={(dates) =>
                  onChange({
                    ...config,
                    mode: "specific",
                    specificDays: dates ?? [],
                  })
                }
                className="w-full"
                classNames={{
                  day_button: "rounded-full",
                  day: "m-1",
                }}
              />
            </div>
          )}

          <div className="flex gap-2 w-full mt-2">
            <Button
              className="flex-1 cursor-pointer"
              variant="outline"
              onClick={onClear}
            >
              Húy
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={onConfirm}>
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRepeatPanel;
