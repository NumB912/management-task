import { test } from 'vitest';
import assert from 'node:assert/strict';
import { SharedTagNotificationUsecase } from '../src/application/usecase/sharedTagNotification.usecase.js';
import { SSERealtimeGateway } from '../src/infrastructure/gateway/realtime.js';
import type IConsumer from '@domain/message/consumer.message.js';

for (const operation of ['update', 'delete']) {
  test(`delivers ${operation} withShare over SSE only to intended users and their tabs`, async () => {
    let deliver;
    const consumer:IConsumer = {
      async sub(exchange: unknown, queue: unknown, keys: unknown, type: unknown, callback: any) {
        assert.equal(exchange, 'Tag.exchange');
        assert.equal(queue, 'Tag-queue-with-share');
        assert.deepEqual(keys, ['Tag.update.withShare', 'Tag.delete.withShare']);
        assert.equal(type, 'direct');
        deliver = callback;
      },
      close: function (): Promise<void> {
        throw new Error('Function not implemented.');
      }
    };
    const gateway = new SSERealtimeGateway();
    const messages = { actor: [], secondTab: [], member: [], unrelated: [] };
    for (const [name, received] of Object.entries(messages)) {
      gateway.register(name === 'secondTab' ? 'actor' : name, { write: (message) => received.push(message) });
    }
    await new SharedTagNotificationUsecase(consumer, gateway).execute();
    await deliver!({ userIds: ['actor', 'member', 'actor'], data: { operation } });
    for (const name of ['actor', 'secondTab', 'member']) {
      assert.equal(messages[name].length, 1);
      const [header, body] = messages[name][0].split('\ndata:');
      assert.equal(header, `event: tag-${operation}-with-share`);
      assert.deepEqual(JSON.parse(body.trim()).data, { operation });
    }
    assert.equal(messages.unrelated.length, 0);
  });
}
