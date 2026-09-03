import {
  IUsecase,
  IRuleRepository,
  IRepeat,
  IRuleWithId,
  AppError,
} from "@/app/core/domain";

interface CreateRuleDTO {
  taskId: string;
  rule: Omit<IRuleWithId,"id"|"created_at"|"updated_at"|"deleted_at">,
  session?: unknown
}

export class CreateRuleUsecase implements IUsecase<{
  rule: Omit<IRuleWithId,"id">,
}> {
  constructor(
    private readonly RuleRepository: IRuleRepository
  ) { }

  async execute(createRuleDTO: CreateRuleDTO): Promise<{
    rule: IRuleWithId,
  }> {
    try {
      const { rule, taskId, session } = createRuleDTO
      const repeatProps = rule
        ? this.toRepeatProps(rule)
        : ({ mode: "none" } as IRepeat);
      const ruleCreate = await this.RuleRepository.create(
        {
          start_date: rule?.start_date
            ? new Date(rule.start_date)
            : undefined,
          end_date: rule?.end_date
            ? new Date(rule.end_date)
            : undefined,
          repeat: repeatProps,
          timer: rule?.timer,
          task: taskId,
          path:rule?.path,
          tags:rule?.tags,
          list:rule.list,
          priority:rule.priority,
        },
        session,
      );
      return {
        rule: ruleCreate
      }
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình tạo task",
        error.status ?? 500,
      );
    }
  }

  private toRepeatProps(rule: Omit<IRuleWithId,"id"|"created_at"|"updated_at"|"deleted_at">) {
    const repeat = rule.repeat
    switch (repeat.mode) {
      case "none":
        return { mode: "none" };

      case "day":
        return { mode: "day", every: repeat.every };

      case "week": {

        return { mode: "week", every: repeat.every, days:repeat.days };
      }

      case "month": {
        return { mode: "month", every: repeat.every, dates:repeat.dates };
      }

      case "specificday":
        return { mode: "specificday", specificDays: repeat.specificDays };

      default:
        return { mode: "none" };
    }
  }

}