import { createClient } from "redis";
import type { RedisClientType } from "@redis/client";
import { ICache } from "../../domain";
import { CacheConfig } from "../../config";

declare global {
  var __redisCacheInstance: RedisCache | undefined;
}

class RedisCache implements ICache {
  private readonly client: RedisClientType;
  private connectPromise: Promise<void> | null = null;

  private constructor() {

    this.client = createClient({
      url: `redis://${CacheConfig.HOST}:${CacheConfig.PORT}`,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("[Redis] Thử lại quá nhiều");
            return new Error("Đã thử lại nhiều lần");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on("error", (err) => console.error("[Redis error]", err));
    this.client.on("connect", () => console.log("[Redis] connected"));
    this.client.on("end", () => {
      console.warn("[Redis] connection ended");
      this.connectPromise = null;
    });
  }
  static getInstance(): RedisCache {
    if (!globalThis.__redisCacheInstance) {
      globalThis.__redisCacheInstance = new RedisCache();
    }
    
    return globalThis.__redisCacheInstance;
  }


  private async ensureConnected(): Promise<void> {
    if (this.client.isOpen) return;
    if (!this.connectPromise) {
      this.connectPromise = this.client.connect().then(() => undefined);
    }
    await this.connectPromise;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    

  
    await this.ensureConnected();
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnected();
    
  
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    await this.ensureConnected();
    
  
    await this.client.del(key);
  }
}

export default RedisCache;