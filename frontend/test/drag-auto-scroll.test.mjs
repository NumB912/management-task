import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getEdgeScrollDelta } from '../app/(front)/utils/dragAutoScroll.ts';

test('does not scroll while the pointer is away from the edges', () => {
  assert.equal(getEdgeScrollDelta(200, 0, 400, 16), 0);
});

test('scrolls toward either edge with matching speeds', () => {
  const left = getEdgeScrollDelta(20, 0, 400, 16);
  const right = getEdgeScrollDelta(380, 0, 400, 16);
  assert.ok(left < 0);
  assert.equal(right, -left);
});

test('increases speed closer to the edge without exceeding the maximum', () => {
  assert.ok(getEdgeScrollDelta(399, 0, 400, 16) > getEdgeScrollDelta(350, 0, 400, 16));
  assert.equal(getEdgeScrollDelta(450, 0, 400, 16), getEdgeScrollDelta(400, 0, 400, 16));
});

test('adjusts the edge zone for narrow mobile containers', () => {
  assert.equal(getEdgeScrollDelta(30, 0, 60, 16), 0);
  assert.ok(getEdgeScrollDelta(59, 0, 60, 16) > 0);
});

test('keeps speed consistent across frame rates and caps long frame delays', () => {
  assert.equal(getEdgeScrollDelta(400, 0, 400, 16), getEdgeScrollDelta(400, 0, 400, 8) * 2);
  assert.equal(getEdgeScrollDelta(400, 0, 400, 1000), getEdgeScrollDelta(400, 0, 400, 32));
});

test('ignores an invisible container or invalid elapsed time', () => {
  assert.equal(getEdgeScrollDelta(10, 20, 20, 16), 0);
  assert.equal(getEdgeScrollDelta(400, 0, 400, -1), 0);
});
