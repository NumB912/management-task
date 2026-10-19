export type RecurringRecord = { date: Date; rule: string };

export function appendRecurringRecord(
  records: Record<string, RecurringRecord> | undefined,
  recurring: { tempId: string; rule: string; date: Date },
): Record<string, RecurringRecord> {
  return {
    ...records,
    [recurring.tempId]: {
      date: new Date(recurring.date),
      rule: recurring.rule,
    },
  };
}
