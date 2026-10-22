import { randomUUID } from 'node:crypto';
import { serialize, deserialize } from 'node:v8';
import { Logger } from '@nestjs/common';
import type { ICache, ITask } from '@/domain';
import { Task } from '@/infrastructure/repositories/database/schema/task.schema';
const VERSION_KEY = 'task:cache-version';
const TTL_SECONDS = 180;
type CachedTask = { version: string; value: string };
export type TaskCacheScope = { userId: string; listId: string };

export class TaskDetailByIdsCache {
  private readonly logger = new Logger(TaskDetailByIdsCache.name);
  constructor(private readonly cache: ICache) {}

  private async bounded<T>(operation: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Task cache timeout')), 250);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  async load(
    ids: string[],
    scope: TaskCacheScope,
    readDatabase: (missingIds: string[]) => Promise<ITask[]>,
  ): Promise<ITask[]> {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return [];
    const key = (id: string) => `task:by-ids:${JSON.stringify([scope.userId, scope.listId, id])}`;
    const tasks = new Map<string, ITask>();
    let version: string;
    try {
      const current = await this.bounded(this.cache.get<string>(VERSION_KEY));
      version = current || randomUUID();
      if (!current) await this.bounded(this.cache.set(VERSION_KEY, version));
      const entries = await this.bounded(this.cache.mget<CachedTask>(uniqueIds.map(key)));
      uniqueIds.forEach((id, index) => {
        const entry = entries[index];
        if (entry?.version !== version) return;
        try {
          const task = deserialize(Buffer.from(entry.value, 'base64')) as ITask;
          if (task.id === id) tasks.set(id, task);
        } catch {

        }
      });
    } catch (error) {
      this.logger.warn(`Task batch cache lookup failed (${String(error)})`);
      return readDatabase(uniqueIds);
    }

    const missingIds = uniqueIds.filter((id) => !tasks.has(id));
    if (missingIds.length) {
      const loaded = await readDatabase(missingIds);
      const missing = new Set(missingIds);
      const results = await Promise.allSettled(loaded.filter((task) => missing.has(task.id)).map(async (task) => {
        tasks.set(task.id, task);
        await this.bounded(this.cache.set(key(task.id), {
          version, value: serialize(task).toString('base64'),
        }, TTL_SECONDS));
      }));
      if (results.some((result) => result.status === 'rejected')) {
        this.logger.warn('Task batch cache write failed');
      }
    }
    return uniqueIds.flatMap((id) => {
      const task = tasks.get(id);
      return task ? [task] : [];
    });
  }

  async invalidate(): Promise<void> {
    try {
      await this.bounded(this.cache.set(VERSION_KEY, randomUUID()));
    } catch {
      this.logger.warn(`Could not invalidate task cache; entries expire after ${TTL_SECONDS}s`);
    }
  }
}
