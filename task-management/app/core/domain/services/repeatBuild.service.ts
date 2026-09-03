
import { AppError, IRepeat } from "@/app/core/domain";

export class RepeatBuilder {
  static build(repeat: IRepeat): IRepeat {
    switch (repeat.mode) {
      case "day":
        return this.buildDaily(repeat);
      case "week":
        return this.buildWeekly(repeat);
      case "month":
        return this.buildMonthly(repeat);
      case "specificday":
        return this.buildSpecificDay(repeat);
      default:
        return { mode: "none" };
    }
  }

  private static buildDaily(repeat: IRepeat): Pick<IRepeat, "mode" | "every"> {
    return {
      mode: "day",
      every: repeat.every ?? 1,
    };
  }

  private static buildWeekly(
    repeat: IRepeat,
  ): Pick<IRepeat, "mode" | "every" | "days"> {
    const days = repeat.days as number[];
    if (!days?.length)
      throw new AppError("NOT_FOUND", "Không tìm thấy days trong weekly", 404);

    return {
      mode: "week",
      every: repeat.every ?? 1,
      days: repeat.days,
    };
  }

  private static buildMonthly(
    repeat: IRepeat,
  ): Pick<IRepeat, "mode" | "every" | "dates"> {
    const dates = repeat.dates as number[];
    if (!dates?.length)
      throw new AppError(
        "NOT_FOUND",
        "Không tìm thấy dates trong monthly",
        404,
      );

    if (Math.max(...dates) > 31 || Math.min(...dates) < 1)
      throw new AppError(
        "BAD_REQUEST",
        "Ngày không được vượt quá 31 và nhỏ hơn 1",
        400,
      );

    return {
      mode: "month",
      every: repeat.every ?? 1,
      dates: repeat.dates,
    };
  }

  private static buildSpecificDay(repeat: IRepeat): IRepeat {
    const { specificDays } = repeat;
    return { mode: "specificday", specificDays };
  }
}