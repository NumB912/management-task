// import { randomUUID } from 'node:crypto';
// import { serialize, deserialize } from 'node:v8';
// import { AppError, type ICache, type ITask } from '@/domain';

// const VERSION_KEY = 'task:cache-version';
// const TTL_SECONDS = 60*3;

// export class TaskDetailByIdsCache {
//   constructor(private readonly cache: ICache) {}

//   private async bounded<T>(operation: Promise<T>): Promise<T> {
//     let timer: ReturnType<typeof setTimeout> | undefined;
//     try {
//       return await Promise.race([
//         operation,
//         new Promise<never>((_, reject) => {
//           timer = setTimeout(() => reject(new AppError('TIMEOUT',"Task cache hết hạn",205)));
//         }),
//       ]);
//     } finally {
//       clearTimeout(timer);
//     }
//   }

//   async load(ids: string[],listId:string, readDatabase: () => Promise<Partial<ITask> | null>) {
//     let version: string;
//     try {
      
//       const current = await this.bounded(this.cache.get<string>(VERSION_KEY));
//       version = current || randomUUID();
//       if (!current) await this.bounded(this.cache.set(VERSION_KEY, version));
//       const entry = await this.bounded(this.cache.get<{ version: string; value: string }>(`task:${id}`));
//       if (entry?.version === version) {
//         return deserialize(Buffer.from(entry.value, 'base64')) as Partial<ITask>;
//       }
//     } catch {
//       return readDatabase();
//     }
//     const task = await readDatabase();
//     if (task) {
//       try {
//          await this.bounded(this.cache.set(`task:${id}`, {
//           version, value: serialize(task).toString('base64'),
//         }, TTL_SECONDS));
//       } catch {
//          }
//     }
//     return task;
//   }

//   async invalidate(): Promise<void> {
//     try {
//         await this.bounded(this.cache.set(VERSION_KEY, randomUUID()));
//     } catch {
//        }
//   }
// }
