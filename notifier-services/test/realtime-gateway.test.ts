import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { SSERealtimeGateway } from '../src/infrastructure/gateway/realtime.js';

function connection() {
  const write = vi.fn();
  const response = { write } as unknown as Response;
  return { write, response };
}

describe('SSERealtimeGateway', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('sends a valid SSE event to all tabs of the intended user only', () => {
    const gateway = new SSERealtimeGateway();
    const first = connection();
    const second = connection();
    const other = connection();
    gateway.register('alice', first.response);
    gateway.register('alice', second.response);
    gateway.register('bob', other.response);

    gateway.pushToUser('alice', 'task-updated', { data: { id: 'task-1' } });

    const message = 'event: task-updated\ndata:' + JSON.stringify({
      data: { id: 'task-1' }, user: 'alice', event: 'task-updated',
    }) + '\n\n';
    expect(first.write).toHaveBeenCalledExactlyOnceWith(message);
    expect(second.write).toHaveBeenCalledExactlyOnceWith(message);
    expect(other.write).not.toHaveBeenCalled();
  });

  it('stops sending to a disconnected tab while keeping other tabs connected', () => {
    const gateway = new SSERealtimeGateway();
    const closed = connection();
    const active = connection();
    gateway.register('alice', closed.response);
    gateway.register('alice', active.response);

    gateway.unregister('alice', closed.response);
    gateway.pushToUser('alice', 'refresh', {});

    expect(closed.write).not.toHaveBeenCalled();
    expect(active.write).toHaveBeenCalledTimes(1);
  });

  it('does not deliver twice when the same connection is registered twice', () => {
    const gateway = new SSERealtimeGateway();
    const client = connection();
    gateway.register('alice', client.response);
    gateway.register('alice', client.response);

    gateway.pushToUser('alice', 'refresh', {});

    expect(client.write).toHaveBeenCalledTimes(1);
  });

  it('handles offline users and reconnecting after the last tab closes', () => {
    const gateway = new SSERealtimeGateway();
    const previous = connection();
    const next = connection();
    expect(() => gateway.unregister('offline', next.response)).not.toThrow();
    expect(() => gateway.pushToUser('offline', 'refresh', {})).not.toThrow();
    gateway.register('alice', previous.response);
    gateway.unregister('alice', previous.response);
    gateway.register('alice', next.response);

    gateway.pushToUser('alice', 'refresh', {});

    expect(previous.write).not.toHaveBeenCalled();
    expect(next.write).toHaveBeenCalledTimes(1);
  });
});
