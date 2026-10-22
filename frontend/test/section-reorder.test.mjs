import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previewSectionOrder, getSectionDropTarget } from '../app/(front)/utils/sectionReorder.ts';

test('previews movement without changing the original order', () => {
  const original = ['a', 'b', 'c'];
  assert.deepEqual(previewSectionOrder(original, 'a', 'b'), ['b', 'a', 'c']);
  assert.deepEqual(original, ['a', 'b', 'c']);
});

test('ignores missing sections and dropping on the same section', () => {
  const order = ['a', 'b'];
  assert.equal(previewSectionOrder(order, 'a', 'a'), order);
  assert.equal(previewSectionOrder(order, 'missing', 'b'), order);
  assert.equal(previewSectionOrder(order, 'a', 'missing'), order);
});

test('persists the final preview position after dragging in both directions', () => {
  const original = ['a', 'b', 'c', 'd'];
  const right = previewSectionOrder(original, 'a', 'd');
  const left = previewSectionOrder(right, 'a', 'c');
  const target = getSectionDropTarget(original, left, 'a');
  assert.deepEqual(left, ['b', 'a', 'c', 'd']);
  assert.equal(target, 'b');
  assert.deepEqual(previewSectionOrder(original, 'a', target), left);
});

test('does not persist when the section returns to its original position', () => {
  const original = ['a', 'b', 'c'];
  const preview = previewSectionOrder(original, 'a', 'b');
  const restored = previewSectionOrder(preview, 'a', 'b');
  assert.deepEqual(restored, original);
  assert.equal(getSectionDropTarget(original, restored, 'a'), null);
});
