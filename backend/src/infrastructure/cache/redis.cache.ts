import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { CacheConfig } from '@/domain/index.js';
import type { ICache } from '@/domain/index.js';
import { createClient, type RedisClientType } from '@redis/client';

@Injectable()
export class RedisCache implements ICache {
  private static instance: RedisCache;
  private client: RedisClientType;
  private connectPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(uri:string): RedisCache {
    if (!this.instance) {
      this.instance = new RedisCache();

      this.instance.client = createClient({
        url: uri,
        socket: {
          reconnectStrategy: (retries) =>
            retries > 10
              ? new Error('Đã thử lại nhiều lần')
              : Math.min(retries * 100, 3000),
        },
      });
      this.instance.client.on('error', (err) =>
        console.error('[Redis error]', err),
      );
      this.instance.client.on('end', () => {
        this.instance.connectPromise = null;
      });
    }

    return this.instance;
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.isOpen) return;
    this.connectPromise ??= this.client.connect().then(
      () => undefined,
      (err) => {
        this.connectPromise = null;
        throw err;
      },
    );
    await this.connectPromise;
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    await this.ensureConnected();
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnected();
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.ensureConnected();
    await this.client.del(key);
  }
}
