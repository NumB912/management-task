import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(front)/components/ui/select";
import { REPEAT_UNITS } from "./repeat.types";
import WeekdayPicker from "./WeekdayPicker";
import DayPicker31 from "../ui/daysSelected.ui";
import { IRepeat } from "@/app/(front)/model/rule/rule.model";
import { Unit } from "@/app/(front)/model/rule/repeat.enum";
import { useEffect } from "react";

interface RepeatByIntervalProps {
  unit: Unit;
  selectedDate: Date;
  setUnit: (unit: Unit) => void;
  config: IRepeat;
  onChange: (patch: IRepeat) => void;
}

type ConfigBuilder = (
  config: IRepeat,
  selectedDate: Date,
) => IRepeat;

const unitConfigStrategies: Record<Unit, ConfigBuilder> = {
  [Unit.Day]: (config) => ({
    ...config,
    mode: Unit.Day,
    every: config.every || 1,
  }),
  [Unit.Week]: (config, date) => ({
    ...config,
    mode: Unit.Week,
    every: config.every || 1,
    days:
      config.days && config.days.length > 0
        ? config.days
        : [date.getDay()],
  }),
  [Unit.Month]: (config, date) => ({
    ...config,
    mode: Unit.Month,
    dates:
      config.dates && config.dates.length > 0
        ? config.dates
        : [date.getDate()],
    every: config.every || 1,
  }),
  [Unit.None]:(config)=>({
    ...config,
    
  })
};

const RepeatByInterval = ({
  selectedDate,
  config,
  onChange,
  unit,
  setUnit,
}: RepeatByIntervalProps) => {
  useEffect(() => {
    onChange(unit&&unitConfigStrategies[unit](config, selectedDate));
  }, [unit]);
  return (
    <div>
      <div className="flex gap-1 items-center">
        <div className="relative flex flex-1 items-center justify-between p-1">
          <span className="text-nowrap text-sm font-bold pr-3">Mỗi: </span>
          <input
            type="number"
            min={1}
            value={config.every || 1}
            defaultValue={1}
            onChange={(e) => {
              onChange({
                until:config.until,
                mode:unit,
                every: Math.max(1, Number(e.target.value)),
              });
            }}
            className="w-full py-1 focus:outline-0 text-sm max-w-20 border-gray-400 border rounded text-left px-2"
          />
        </div>

        <Select value={unit} onValueChange={(value) => setUnit(value as Unit)}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ zIndex: 9999 }}>
            <SelectGroup className="bg-white">
              {REPEAT_UNITS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex mt-2">
        {unit === Unit.Month ? (
          <DayPicker31
            selected={config?.dates || [selectedDate.getDate()]}
            onSelect={(dates) =>
              onChange({
                until:config.until,
                mode: unit,
                dates: dates,
                every: config.every || 1,
              })
            }
          />
        ) : unit === Unit.Week ? (
          <WeekdayPicker
            selected={config.days || [selectedDate.getDay()]}
            onSelect={(days) =>
              onChange({
                until:config.until,
                mode: unit,
                days:days.length > 0 ? days : [selectedDate.getDay()],
                every: config.every || 1,
              })
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default RepeatByInterval;
