import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTagOperations, applyTagOperations, prepareTaskRuleUpdate } from '../app/(front)/utils/taskTagOperations.ts';

test('updateTask accepts operations and keeps optimistic tags as an array', () => {
  const current = { id: 'rule', tags: ['Old', 'Keep'], priority: 3 };
  const input = { tags: { delete: ['Old'], add: ['New'] }, priority: 1 };
  const prepared = prepareTaskRuleUpdate(current, input);
  assert.deepEqual(prepared.data, input);
  assert.deepEqual(prepared.rule, { id: 'rule', tags: ['Keep', 'New'], priority: 1 });
  assert.deepEqual(current.tags, ['Old', 'Keep']);
});

test('updateTask converts array edits to operations without clearing omitted tags', () => {
  const current = { id: 'rule', tags: ['Old'], priority: 3 };
  assert.deepEqual(prepareTaskRuleUpdate(current, { tags: ['New'] }).data, {
    tags: { add: ['New'], delete: ['Old'] },
  });
  const unrelated = prepareTaskRuleUpdate(current, { priority: 1 });
  assert.deepEqual(unrelated.data, { priority: 1 });
  assert.deepEqual(unrelated.rule.tags, ['Old']);
});

test('selecting and clearing tags produces add and delete operations', () => {
  assert.deepEqual(buildTagOperations(['Keep'], ['Keep', 'New']), { add: ['New'] });
  assert.deepEqual(buildTagOperations(['Keep', 'Old'], ['Keep']), { delete: ['Old'] });
  assert.deepEqual(buildTagOperations(['Old'], []), { delete: ['Old'] });
});

test('replacing a selected tag sends add and delete', () => {
  const operations = buildTagOperations(['Keep', 'Old'], ['Keep', 'New']);
  assert.deepEqual(operations, { add: ['New'], delete: ['Old'] });
  assert.deepEqual(applyTagOperations(['Keep', 'Old'], operations), ['Keep', 'New']);
});

test('mixed changes preserve unrelated tags and ignore case and duplicates', () => {
  const before = ['Keep', 'Old', 'Gone'];
  const next = ['keep', 'New', 'Extra', 'new'];
  const operations = buildTagOperations(before, next);
  assert.deepEqual(operations, { add: ['new', 'Extra'], delete: ['Old', 'Gone'] });
  assert.deepEqual(applyTagOperations(before, operations), ['Keep', 'new', 'Extra']);
  assert.deepEqual(before, ['Keep', 'Old', 'Gone']);
  assert.deepEqual(buildTagOperations(['Tag'], ['tag']), {});
});

test('optimistic operations match the backend order: delete then add', () => {
  assert.deepEqual(applyTagOperations(['Old', 'Keep'], {
    delete: ['OLD'], add: ['Old', 'NEW'],
  }), ['Keep', 'Old', 'NEW']);
  assert.deepEqual(applyTagOperations(['Old'], ['New', 'new']), ['new']);
});

test('rule tags support only add and delete operations', () => {
  const input = { tags: {
    delete: ['Keep'], add: ['New'],
  } };
  const prepared = prepareTaskRuleUpdate({ id: 'rule', tags: ['Old', 'Keep'] }, input);
  assert.deepEqual(prepared.data, input);
  assert.deepEqual(prepared.rule.tags, ['Old', 'New']);
});
