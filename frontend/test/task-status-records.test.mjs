import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendRecurringRecord } from '../app/(front)/providers/task-status-records.ts';

test('keeps every completion record accumulated before the batch is sent', () => {
  let records;
  for (let day = 1; day <= 3; day++) {
    records = appendRecurringRecord(records, {
      tempId: `completion-${day}`,
      rule: `rule-${day}`,
      date: new Date(`2026-10-0${day}T00:00:00Z`),
    });
  }
  const payload = JSON.parse(JSON.stringify({ id: 'task-a', record: records }));
  assert.deepEqual(Object.keys(payload.record), ['completion-1', 'completion-2', 'completion-3']);
  for (let day = 1; day <= 3; day++) {
    assert.equal(payload.record[`completion-${day}`].rule, `rule-${day}`);
    assert.equal(payload.record[`completion-${day}`].date, `2026-10-0${day}T00:00:00.000Z`);
  }
});

test('does not modify the records of a previously captured batch', () => {
  const first = appendRecurringRecord(undefined, {
    tempId: 'first', rule: 'rule-1', date: new Date('2026-10-01'),
  });
  const next = appendRecurringRecord(first, {
    tempId: 'second', rule: 'rule-2', date: new Date('2026-10-02'),
  });
  assert.deepEqual(Object.keys(first), ['first']);
  assert.deepEqual(Object.keys(next), ['first', 'second']);
});
