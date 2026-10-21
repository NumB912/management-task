import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SharedTagNotificationUsecase } from '../src/application/usecase/sharedTagNotification.usecase.ts';
import { SSERealtimeGateway } from '../src/infrastructure/gateway/realtime.ts';

for (const operation of ['update', 'delete']) {
  test(`delivers ${operation} withShare over SSE only to intended users and their tabs`, async () => {
    let deliver;
    const consumer = { async sub(exchange, queue, keys, type, callback) {
      assert.equal(exchange, 'Tag.exchange');
      assert.equal(queue, 'Tag-queue-with-share');
      assert.deepEqual(keys, ['Tag.update.withShare', 'Tag.delete.withShare']);
      assert.equal(type, 'direct');
      deliver = callback;
    } };
    const gateway = new SSERealtimeGateway();
    const messages = { actor: [], secondTab: [], member: [], unrelated: [] };
    for (const [name, received] of Object.entries(messages)) {
      gateway.register(name === 'secondTab' ? 'actor' : name, { write: (message) => received.push(message) });
    }
    await new SharedTagNotificationUsecase(consumer, gateway).execute();
    await deliver({ userIds: ['actor', 'member', 'actor'], data: { operation } });
    for (const name of ['actor', 'secondTab', 'member']) {
      assert.equal(messages[name].length, 1);
      const [header, body] = messages[name][0].split('\ndata:');
      assert.equal(header, `event: tag-${operation}-with-share`);
      assert.deepEqual(JSON.parse(body.trim()).data, { operation });
    }
    assert.equal(messages.unrelated.length, 0);
  });
}
