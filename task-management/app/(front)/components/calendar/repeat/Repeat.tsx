import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/(front)/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import CustomRepeatPanel from "./CustomRepeatPanel";
import {
  dayOfWeek,
  RepeatModePresent,
  RepeatType,
  Unit,
} from "@/app/(front)/model/rule/repeat.enum";
import { IRepeat } from "@/app/(front)/model/rule/rule.model";
import { REPEAT_PRESETS } from "./repeat.types";
import { Button } from "@/app/(front)/components/ui/button";
import { ArrowDown, Check, ChevronDown, RepeatIcon } from "lucide-react";
import { useRepeatContext } from "@/app/(front)/context/repeat.context";
import {
  formatDate,
  formatSpecific,
} from "@/app/(front)/utils/getDayOfMonth.utils";
import { cn } from "@/lib/utils";

const RepeatTypeDay = (repeat: IRepeat): IRepeat => {
  return {
    mode: repeat.mode,
    every: repeat.every,
  };
};

const RepeatTypeWeek = (repeat: IRepeat): IRepeat => {
  return {
    mode: repeat.mode,
    every: repeat.every,
    days: repeat.days,
  };
};

const RepeatTypeMonth = (repeat: IRepeat): IRepeat => {
  return {
    mode: repeat.mode,
    every: repeat.every,
    dates: repeat.dates,
  };
};

const RepeatTypeSpecificDay = (repeat: IRepeat): IRepeat => {
  return {
    mode: repeat.mode,
    specificDays: repeat.specificDays,
  };
};

const ShowRepeatMonth = (repeat: IRepeat): string | undefined => {
  if (!repeat.dates) {
    return undefined;
  }
  const monthChosen = repeat.dates?.toSorted((a, b) => a - b);

  return (
    `Mỗi ${repeat.every} tháng: ` +
    monthChosen.map((value) => `Ngày ${value}`).join(" ,")
  );
};

const ShowRepeatWeek = (repeat: IRepeat): string | undefined => {
  if (!repeat.days) {
    return undefined;
  }
  const weekChoosen = repeat.days
    ?.toSorted((a, b) => Number(a) - Number(b))
    .map((day) => dayOfWeek[Number(day)])
    .join();

  return `Mỗi ${repeat.every} tuần: ` + weekChoosen;
};

const ShowRepeatDay = (repeat: IRepeat): string | undefined => {
  if (!repeat.every) {
    return undefined;
  }
  return `Mỗi ${repeat.every} ngày`;
};

const ShowRepeatSpecific = (repeat: IRepeat): string | undefined => {
  if (!repeat.specificDays) {
    return undefined;
  }

  const specificDays = repeat.specificDays
    ?.toSorted((a, b) => Number(a) - Number(b))
    .map((day) => formatSpecific(day))
    .join(", ");
  return "Vào những ngày: " + specificDays;
};

const FactoryRepeat = (repeat: IRepeat): IRepeat => {
  switch (repeat.mode) {
    case "day":
      return RepeatTypeDay(repeat);
    case "week":
      return RepeatTypeWeek(repeat);
    case "month":
      return RepeatTypeMonth(repeat);
    case "specific":
      return RepeatTypeSpecificDay(repeat);
    default:
      return {
        mode: repeat.mode,
      };
  }
};

const FactoryShowRepeat = (repeat: IRepeat): string | undefined => {
  switch (repeat.mode) {
    case "day":
      return ShowRepeatDay(repeat);
    case "week":
      return ShowRepeatWeek(repeat);
    case "month":
      return ShowRepeatMonth(repeat);
    case "specific":
      return ShowRepeatSpecific(repeat);
    case "none":
      return "Lặp lại";
  }
};

const Repeat = () => {
  const { repeat, setRepeat, selectedDate, setDefaultRepeat, defaultRepeat } =
    useRepeatContext();
  const [isOpenCustom, setIsOpenCustom] = useState<boolean>(false);
  const [repeatType, setRepeatType] = useState<RepeatType>(RepeatType.Repeat);
  const [unit, setUnit] = useState<Unit>(Unit.Day);
  const [valueRepeat, setValueRepeat] = useState<RepeatModePresent>(
    RepeatModePresent.None,
  );
  const [openMenuCustom, setOpenMenuCustom] = useState<boolean>(false);
  const patchConfig = (patch: IRepeat) => {
    if (patch.mode !== "specific") {
      setRepeat(FactoryRepeat(patch));
    } else {
      setRepeat(patch);
    }
  };

  useEffect(() => {
    setRepeat(defaultRepeat);
  }, [defaultRepeat]);

  useEffect(() => {
    if (repeat.mode == "none") {
      setValueRepeat(RepeatModePresent.None);
    }
  }, [repeat]);

  useEffect(() => {
    switch (repeat.mode) {
      case "none":
        setValueRepeat(RepeatModePresent.None);
        break;
      default:
        setValueRepeat(RepeatModePresent.Custom);
        break;
    }
  }, []);

  useEffect(() => {
    switch (valueRepeat) {
      case RepeatModePresent.Custom:
        setRepeatType(RepeatType.Repeat);
        break;
      case RepeatModePresent.Daily:
        setDefaultRepeat(
          FactoryRepeat({
            mode: "day",
            every: 1,
          }),
        );
        break;
      case RepeatModePresent.Monthly:
        setDefaultRepeat(
          FactoryRepeat({
            mode: "month",
            every: 1,
            dates: [selectedDate!.getDate()],
          }),
        );
        break;
      case RepeatModePresent.Weekly:
        setDefaultRepeat(
          FactoryRepeat({
            mode: "week",
            every: 1,
            days: [selectedDate!.getDay()],
          }),
        );
        break;
      default:
        break;
    }
  }, [valueRepeat, selectedDate]);

  const handleConfirm = () => {
    setIsOpenCustom(false);
    setDefaultRepeat(repeat);
  };

  const handleClear = () => {
    setRepeat(defaultRepeat);
    setIsOpenCustom(false);
  };

  const handleClose = () => {
    setRepeat(defaultRepeat);
  };

  return (
    <div className="w-full relative">
      <DropdownMenu
        open={openMenuCustom}
        onOpenChange={() => {
          setOpenMenuCustom((prev) => !prev);
        }}
      >
        <DropdownMenuTrigger className="w-full flex" asChild>
          <Button
            className={cn(
              "w-full! flex! flex-1 justify-start! overflow-hidden",
            )}
            variant={"outline"}
          >
            <div className="flex items-center gap-2 justify-between! w-full">
              <div className="flex gap-2 min-w-0 max-w-65 items-center">
                <RepeatIcon />
                <span className="truncate! min-w-0">
                  {valueRepeat == RepeatModePresent.None
                    ? "Lặp lại"
                    : FactoryShowRepeat(repeat)}
                </span>
              </div>
              <ChevronDown />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-60 p-0">
          {REPEAT_PRESETS.map(({ value, label }) => (
            <Button
              variant={"ghost"}
              className="w-full rounded"
              key={value}
              asChild
              onClick={() => {
                if (value === "custom") {
                  setIsOpenCustom(true);
                }
                setOpenMenuCustom(false);
                setValueRepeat(value as RepeatModePresent);
              }}
            >
              <span
                className={cn(
                  "flex items-center justify-start text-ellipsis w-full",
                )}
              >
                {label}
                {value === valueRepeat && <Check />}
              </span>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu
        open={isOpenCustom}
        onOpenChange={(open) => {
          if (open === false) {
            handleClose();
          }
          setIsOpenCustom((prev) => !prev);
        }}
      >
        <DropdownMenuTrigger asChild>
          <div className="absolute" />
        </DropdownMenuTrigger>
        <DropdownMenuContent style={{ zIndex: 60 }} className="w-full">
          <CustomRepeatPanel
            selectedDate={selectedDate!}
            setUnit={setUnit}
            unit={unit}
            config={repeat}
            repeatType={repeatType}
            setRepeatType={setRepeatType}
            onChange={patchConfig}
            onConfirm={handleConfirm}
            onClear={handleClear}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Repeat;
